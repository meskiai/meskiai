import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import Pop3Command from 'node-pop3';
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export interface FetchedEmail {
  pop3Uid: string;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  from: string;
  to: string;
  subject: string;
  text: string;
  date: Date;
}

/**
 * Fetches NEW emails via POP3, skipping:
 * - Already known UIDs (already in DB)
 * - Emails sent BY the account itself (to prevent reply loops)
 */
export async function fetchUnreadEmailsPOP3(
  email: string,
  appPassword: string,
  knownUids: string[]
): Promise<FetchedEmail[]> {
  // Gmail POP3 recent mode ensures we fetch all emails from the last 30 days,
  // preventing emails from being permanently hidden after a transient connection failure.
  const pop3Username = `recent:${email}`;

  const pop3 = new Pop3Command({
    user: pop3Username,
    password: appPassword,
    host: 'pop.gmail.com',
    port: 995,
    tls: true
  });

  const fetchedEmails: FetchedEmail[] = [];
  const emailLower = email.toLowerCase();

  try {
    // 20s timeout to get the UID list
    let timeoutId: any;
    const uidlPromise = pop3.UIDL();
    const timeoutPromise = new Promise<any>((_, reject) =>
      timeoutId = setTimeout(() => {
        try { pop3.QUIT(); } catch (e) {}
        reject(new Error('POP3 connection timed out'));
      }, 20000)
    );

    const uidlList = await Promise.race([uidlPromise, timeoutPromise]);
    clearTimeout(timeoutId);

    const knownSet = new Set(knownUids);

    // Scan at most the 30 most recent messages in the inbox to avoid getting stuck on ancient mail
    const maxScan = Math.min(30, uidlList.length);
    const startIndex = uidlList.length - 1;
    const endIndex = uidlList.length - maxScan;

    for (let i = startIndex; i >= endIndex; i--) {
      const item = uidlList[i];
      if (!item || item.length < 2) continue;
      const msgNum = item[0];
      const uid = item[1];

      // Skip already processed UIDs
      if (knownSet.has(uid)) continue;

      // Limit to 10 new emails per sync cycle to prevent long timeouts and process recent emails instantly
      if (fetchedEmails.length >= 10) {
        console.log(`[POP3] Limit 10 nowych maili w jednym cyklu osiągnięty. Przerywam dalsze pobieranie.`);
        break;
      }

      try {
        // Fetch the full body directly to avoid double POP3 commands and round-trips
        let retrTimeoutId: any;
        const retrPromise = pop3.RETR(msgNum);
        const retrTimeout = new Promise<any>((_, reject) =>
          retrTimeoutId = setTimeout(() => {
            reject(new Error('POP3 RETR timeout'));
          }, 15000)
        );

        let rawMsg;
        try {
          rawMsg = await Promise.race([retrPromise, retrTimeout]);
        } catch (e) {
          console.warn(`POP3 RETR failed for msgNum ${msgNum}:`, e);
          throw e; // Abort session on failure to avoid hanging on a dead socket
        } finally {
          clearTimeout(retrTimeoutId);
        }

        const parsed: any = await simpleParser(rawMsg);
        const msgDate = parsed.date || new Date();
        let messageId = parsed.messageId || `uid-${uid}`;
        let fromAddr = parsed.from?.value?.[0]?.address || parsed.from?.text || '';

        const messageAgeHours = (Date.now() - msgDate.getTime()) / (1000 * 60 * 60);

        // If the email is older than 48 hours, skip processing it (but record UID so we don't download it again)
        if (messageAgeHours > 48) {
          fetchedEmails.push({
            pop3Uid: uid,
            messageId: messageId,
            from: fromAddr || 'ignored@old.com',
            to: email,
            subject: parsed.subject || '(Old skipped)',
            text: '',
            date: msgDate,
            _isSelf: false
          } as any);
          continue;
        }

        fromAddr = parsed.from?.value?.[0]?.address || parsed.from?.text || '';
        
        const cleanFrom = (fromAddr.match(/<(.+?)>/)?.[1] || fromAddr).trim().toLowerCase();
        
        // ── KRYTYCZNE: Pomijaj maile wysłane przez samego agenta (zapobiega pętli auto-reply) ──
        if (cleanFrom === emailLower) {
          // Zapisujemy UID i pełną treść żeby asystent widział co odpisaliśmy ręcznie
          fetchedEmails.push({
            pop3Uid: uid,
            messageId: parsed.messageId || `self-${uid}`,
            from: fromAddr,
            to: email,
            subject: parsed.subject || '',
            text: parsed.text || parsed.html || '',
            date: parsed.date || new Date(),
            _isSelf: true
          } as any);
          continue;
        }

        const toObj = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
        const toAddr = toObj?.value?.[0]?.address || toObj?.text || email;
        messageId = parsed.messageId || `uid-${uid}`;

        let inReplyTo = parsed.inReplyTo;
        if (Array.isArray(inReplyTo)) inReplyTo = inReplyTo[0];

        let references = parsed.references;
        if (typeof references === 'string') references = [references];

        // ── KRYTYCZNE: Obsługa załączników PDF (dla umów/faktur) ──
        let attachmentText = '';
        if (parsed.attachments && parsed.attachments.length > 0) {
          for (const att of parsed.attachments) {
            if (att.contentType === 'application/pdf' && att.content) {
              try {
                const pdfData = await pdfParse(att.content);
                const pdfStr = pdfData.text.replace(/\s+/g, ' ').trim();
                if (pdfStr) {
                  attachmentText += `\n\n--- ZAŁĄCZNIK PDF: ${att.filename || 'dokument.pdf'} ---\n${pdfStr.substring(0, 4000)}`;
                }
              } catch (pdfErr: any) {
                console.error(`[Agent AI] Błąd parsowania PDF ${att.filename}:`, pdfErr.message);
              }
            }
          }
        }

        const finalText = (parsed.text || '') + attachmentText;

        fetchedEmails.push({
          pop3Uid: uid,
          messageId,
          inReplyTo,
          references: references as string[] | undefined,
          from: fromAddr,
          to: toAddr,
          subject: parsed.subject || '(Brak tematu)',
          text: finalText,
          date: parsed.date || new Date()
        });
      } catch (err: any) {
        console.error(`[Agent AI] Błąd parsowania POP3 UID ${uid}:`, err.message);
        
        const isConnectionError = 
          err.message.toLowerCase().includes('timeout') || 
          err.message.toLowerCase().includes('connection') || 
          err.message.toLowerCase().includes('econn') || 
          err.message.toLowerCase().includes('socket') ||
          err.message.toLowerCase().includes('closed');
          
        if (isConnectionError) {
          throw err; // Rethrow to abort the entire POP3 session immediately
        }
        
        // Push a placeholder so the UID is recorded and not fetched infinitely
        fetchedEmails.push({
          pop3Uid: uid,
          messageId: `broken-${uid}`,
          from: 'unknown@error.com',
          to: email,
          subject: '(Błąd odczytu)',
          text: '',
          date: new Date(),
          _isSelf: true // Treat as self to ignore it safely in cron
        } as any);
      }
    }

    try { await pop3.QUIT(); } catch (e) {}

  } catch (error: any) {
    console.error('[Agent AI] Błąd połączenia POP3:', error.message);
    try { pop3.QUIT(); } catch (e) {}
    throw error;
  }

  return fetchedEmails;
}

/**
 * Sends a reply via SMTP (smtp.gmail.com:465)
 */
export async function sendReplySMTP(
  email: string,
  appPassword: string,
  to: string,
  subject: string,
  text: string,
  inReplyToMessageId?: string,
  references?: string
) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: email, pass: appPassword }
  });

  // Clean any accidental markdown formatting from AI-generated text
  const cleanedText = text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → plain
    .replace(/\*(.+?)\*/g, '$1')       // *italic* → plain
    .replace(/^#{1,6}\s+/gm, '')       // # Heading → plain
    .replace(/^[-*]\s+/gm, '• ')       // - item / * item → bullet
    .trim();

  // Build an HTML version for better rendering across email clients
  const htmlBody = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#222">${
    cleanedText
      .split('\n')
      .map(line => line.trim() === '' ? '<br>' : `<p style="margin:0 0 8px 0">${line}</p>`)
      .join('')
  }</body></html>`;

  const mailOptions: any = { from: email, to, subject, text: cleanedText, html: htmlBody };

  if (inReplyToMessageId) mailOptions.inReplyTo = inReplyToMessageId;
  if (references) mailOptions.references = references;
  else if (inReplyToMessageId) mailOptions.references = inReplyToMessageId;

  const info = await transporter.sendMail(mailOptions);
  return info;
}

/**
 * Sends a premium system welcome email to a new subscriber.
 */
export async function sendSystemWelcomeEmail(toEmail: string) {
  const systemEmail = process.env.SYSTEM_SMTP_EMAIL;
  const systemPassword = process.env.SYSTEM_SMTP_PASSWORD;

  if (!systemEmail || !systemPassword) {
    console.warn("[Welcome Email] SYSTEM_SMTP_EMAIL or SYSTEM_SMTP_PASSWORD not configured. Skipping welcome email.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: systemEmail, pass: systemPassword }
  });

  const subject = "Witamy w MESKIAI! Twój wirtualny pracownik AI jest gotowy 🚀";
  
  const textBody = `
Dziękujemy za zakup subskrypcji MESKIAI!

Cieszymy się, że dołączyłeś do grona przedsiębiorców, którzy delegują powtarzalne zadania i zyskują czas dzięki sztucznej inteligencji.

Twój osobisty asystent AI został automatycznie włączony.

CO DALEJ?
1. Przejdź do swojego panelu: https://meskiai.com/dashboard
2. Skonfiguruj Hasło Aplikacji Google w zakładce "Konfiguracja", aby umożliwić asystentowi bezpieczne odczytywanie i odpisywanie na wiadomości.
3. Wprowadź podstawowe informacje o swojej firmie w Bazie Wiedzy — dzięki temu odpowiedzi AI będą w 100% precyzyjne i dopasowane do Twojej branży.

PRIORYTETOWY KONTAKT Z NAMI:
Jako nasz subskrybent zyskujesz błyskawiczny i bezpośredni kontakt z naszym zespołem technicznym. Jeśli potrzebujesz pomocy przy wdrożeniu lub masz pytania:
- Odpowiedz bezpośrednio na ten e-mail
- Napisz na: support@meskiai.com
Jesteśmy do Twojej dyspozycji, aby pomóc Ci wycisnąć 100% możliwości z platformy.

Życzymy udanej automatyzacji,
Zespół MESKIAI
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1c1c1e;
      background-color: #f5f5f7;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #f5f5f7;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e5e5ea;
    }
    .header {
      background: linear-gradient(135deg, #007aff, #5856d6);
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      margin: 0 0 16px 0;
      color: #3a3a3c;
    }
    .badge {
      display: inline-block;
      background: rgba(0, 122, 255, 0.1);
      color: #007aff;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .steps {
      background: #f5f5f7;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      border: 1px solid #e5e5ea;
    }
    .steps h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 15px;
      color: #1c1c1e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .step-item {
      margin-bottom: 12px;
      font-size: 14px;
      color: #3a3a3c;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-number {
      font-weight: 700;
      color: #007aff;
    }
    .support-box {
      border-left: 4px solid #5856d6;
      background: rgba(88, 86, 214, 0.05);
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin: 24px 0;
    }
    .support-box h4 {
      margin: 0 0 8px 0;
      color: #5856d6;
      font-size: 15px;
      font-weight: 600;
    }
    .button-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .btn {
      display: inline-block;
      background: #007aff;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(0,122,255,0.25);
    }
    .footer {
      background: #f5f5f7;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #8e8e93;
      border-top: 1px solid #e5e5ea;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Witamy w MESKIAI!</h1>
      </div>
      <div class="content">
        <div class="greeting">Cześć!</div>
        <p>Dziękujemy za zakup subskrypcji platformy MESKIAI. Cieszymy się, że dołączyłeś do grona nowoczesnych firm, które delegują powtarzalne zadania i zyskują wolny czas dzięki sztucznej inteligencji.</p>
        
        <div class="badge">Twój Asystent AI został aktywowany</div>

        <div class="steps">
          <h3>Szybki start (Kolejne kroki):</h3>
          <div class="step-item"><span class="step-number">1.</span> Wejdź do swojego panelu sterowania na <a href="https://meskiai.com/dashboard" style="color:#007aff;text-decoration:none;font-weight:500;">meskiai.com/dashboard</a>.</div>
          <div class="step-item"><span class="step-number">2.</span> Skonfiguruj <strong>Hasło Aplikacji Google</strong> w zakładce "Konfiguracja", aby umożliwić asystentowi bezpieczną pracę.</div>
          <div class="step-item"><span class="step-number">3.</span> Uzupełnij <strong>Bazę Wiedzy</strong> o firmie, aby asystent AI znał Twoją ofertę i pisał ze 100% precyzją.</div>
        </div>

        <div class="support-box">
          <h4>Błyskawiczny kontakt z nami:</h4>
          <p style="margin: 0; font-size: 14px;">Jako nasz subskrybent masz zapewniony priorytetowy i bezpośredni kontakt z nami. Jeśli potrzebujesz pomocy przy konfiguracji lub wdrożeniu:</p>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 14px; color: #3a3a3c;">
            <li>Odpowiedz bezpośrednio na tego maila</li>
            <li>Napisz na nasz bezpośredni adres: <a href="mailto:support@meskiai.com" style="color:#5856d6;text-decoration:none;font-weight:500;">support@meskiai.com</a></li>
          </ul>
        </div>

        <div class="button-container">
          <a href="https://meskiai.com/dashboard" class="btn" style="color: #ffffff;">Przejdź do Panelu Dashboard</a>
        </div>
      </div>
      <div class="footer">
        Wiadomość wygenerowana automatycznie przez platformę MESKIAI.<br>
        &copy; 2026 MESKIAI. Wszelkie prawa zastrzeżone.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const mailOptions = {
    from: `"MESKIAI Support" <${systemEmail}>`,
    to: toEmail,
    subject,
    text: textBody,
    html: htmlBody
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Welcome Email] Wysłano e-mail powitalny do ${toEmail}`);
  return info;
}

/**
 * Validates POP3 credentials with detailed error reporting.
 */
export async function validatePop3CredentialsDetailed(
  email: string,
  appPassword: string
): Promise<{ isValid: boolean; error?: string }> {
  const pop3 = new Pop3Command({
    user: email, password: appPassword,
    host: 'pop.gmail.com', port: 995, tls: true
  });

  try {
    let timeoutId: any;
    const connectPromise = pop3.UIDL();
    const timeoutPromise = new Promise<any>((_, reject) =>
      timeoutId = setTimeout(() =>
        reject(new Error('Przekroczono czas oczekiwania. Spróbuj ponownie.')), 12000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    try { await pop3.QUIT(); } catch (e) {}
    return { isValid: true };
  } catch (error: any) {
    try { pop3.QUIT(); } catch (e) {}
    let errMsg = error?.message || String(error);
    if (
      errMsg.includes('Invalid credentials') ||
      errMsg.includes('login failed') ||
      errMsg.includes('Username and password not accepted') ||
      errMsg.includes('Web login required') ||
      errMsg.includes('AUTH')
    ) {
      errMsg = 'Nieprawidłowe hasło aplikacji lub błędny adres e-mail.';
    } else if (errMsg.includes('POP access')) {
      errMsg = 'POP3 nie jest włączony w ustawieniach Gmail. Włącz go w: Ustawienia → Przekazywanie i POP/IMAP.';
    }
    return { isValid: false, error: errMsg };
  }
}

/** @deprecated Use validatePop3CredentialsDetailed instead */
export async function validatePop3Credentials(email: string, appPassword: string): Promise<boolean> {
  const result = await validatePop3CredentialsDetailed(email, appPassword);
  return result.isValid;
}
