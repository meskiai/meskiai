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
  const pop3 = new Pop3Command({
    user: email,
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

    for (const item of uidlList) {
      if (!item || item.length < 2) continue;
      const msgNum = item[0];
      const uid = item[1];

      // Skip already processed UIDs
      if (knownSet.has(uid)) continue;

      try {
        let retrTimeoutId: any;
        const retrPromise = pop3.RETR(msgNum);
        const retrTimeout = new Promise<any>((_, reject) =>
          retrTimeoutId = setTimeout(() => {
            reject(new Error('POP3 RETR timeout'));
          }, 10000)
        );

        let rawMsg;
        try {
          rawMsg = await Promise.race([retrPromise, retrTimeout]);
        } catch (e) {
          console.warn(`POP3 RETR failed for msgNum ${msgNum}:`, e);
          continue;
        } finally {
          clearTimeout(retrTimeoutId);
        }
        const parsed: any = await simpleParser(rawMsg);

        const fromAddr = parsed.from?.value?.[0]?.address || parsed.from?.text || '';
        
        // ── KRYTYCZNE: Pomijaj maile wysłane przez samego agenta (zapobiega pętli auto-reply) ──
        if (fromAddr.toLowerCase() === emailLower) {
          // Zapisujemy UID żeby następnym razem ten mail był pominięty szybciej
          fetchedEmails.push({
            pop3Uid: uid,
            messageId: parsed.messageId || `self-${uid}`,
            from: fromAddr,
            to: email,
            subject: parsed.subject || '',
            text: '',
            date: parsed.date || new Date(),
            _isSelf: true
          } as any);
          continue;
        }

        const toObj = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
        const toAddr = toObj?.value?.[0]?.address || toObj?.text || email;
        const messageId = parsed.messageId || `uid-${uid}-${Date.now()}`;

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

  const mailOptions: any = { from: email, to, subject, text };

  if (inReplyToMessageId) mailOptions.inReplyTo = inReplyToMessageId;
  if (references) mailOptions.references = references;
  else if (inReplyToMessageId) mailOptions.references = inReplyToMessageId;

  const info = await transporter.sendMail(mailOptions);
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
