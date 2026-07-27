import Pop3Command from 'node-pop3';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';

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
 * Fetches unread emails via POP3.
 * Connects to pop.gmail.com:995
 * Skip UIDs that are already present in knownUids array.
 */
export async function fetchUnreadEmailsPOP3(email: string, appPassword: string, knownUids: string[]): Promise<FetchedEmail[]> {
  const pop3 = new Pop3Command({
    user: email,
    password: appPassword,
    host: 'pop.gmail.com',
    port: 995,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  const fetchedEmails: FetchedEmail[] = [];

  try {
    // connect, login and get the list of UIDL
    const uids = await pop3.UIDL();
    
    // uids is an array of [msgNumber, uid] strings, e.g. [['1', 'uid1'], ['2', 'uid2']]
    for (const [msgNumberStr, uid] of uids) {
      if (knownUids.includes(uid)) continue; // skip already seen emails

      const msgNumber = parseInt(msgNumberStr, 10);
      try {
        const rawSource = await pop3.RETR(msgNumber);
        const parsed = await simpleParser(rawSource);

        const fromAddr = parsed.from?.value?.[0]?.address || parsed.from?.text || '';
        const toObj = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
        const toAddr = toObj?.value?.[0]?.address || toObj?.text || email;
        const messageId = parsed.messageId || `uid-${uid}-${Date.now()}`;

        let inReplyTo = parsed.inReplyTo;
        if (Array.isArray(inReplyTo)) inReplyTo = inReplyTo[0];

        let references = parsed.references;
        if (typeof references === 'string') references = [references];

        fetchedEmails.push({
          pop3Uid: uid,
          messageId,
          inReplyTo,
          references: references as string[] | undefined,
          from: fromAddr,
          to: toAddr,
          subject: parsed.subject || '(Brak tematu)',
          text: parsed.text || '',
          date: parsed.date || new Date()
        });
      } catch (err: any) {
        console.error(`[Agent AI] Błąd pobierania wiadomości ${uid}:`, err.message);
      }
    }
    
    await pop3.QUIT();
  } catch (error: any) {
    console.error('[Agent AI] Błąd połączenia POP3:', error);
    try { await pop3.QUIT(); } catch (e) {}
    throw error;
  }

  return fetchedEmails;
}


/**
 * Sends a reply via SMTP.
 * Connects to smtp.gmail.com:465
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
    auth: {
      user: email,
      pass: appPassword
    }
  });

  const mailOptions: any = {
    from: email,
    to,
    subject,
    text
  };

  // Ensure threading is preserved
  if (inReplyToMessageId) {
    mailOptions.inReplyTo = inReplyToMessageId;
  }
  if (references) {
    mailOptions.references = references;
  } else if (inReplyToMessageId) {
    mailOptions.references = inReplyToMessageId;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("[SMTP Send Error]", error);
    throw error;
  }
}

/**
 * Validates IMAP credentials by attempting a connection.
 */
export async function validateImapCredentials(email: string, appPassword: string): Promise<boolean> {
  const pop3 = new Pop3Command({
    user: email,
    password: appPassword,
    host: 'pop.gmail.com',
    port: 995,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  try {
    await pop3.UIDL();
    await pop3.QUIT();
    return true;
  } catch (error) {
    try { await pop3.QUIT(); } catch (e) {}
    return false;
  }
}

export async function validateImapCredentialsDetailed(email: string, appPassword: string): Promise<{isValid: boolean, error?: string}> {
  const pop3 = new Pop3Command({
    user: email,
    password: appPassword,
    host: 'pop.gmail.com',
    port: 995,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  try {
    const connectPromise = pop3.UIDL().then(() => true);
    const timeoutPromise = new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Przekroczono czas oczekiwania (Timeout). Serwery Google nie odpowiadają. Spróbuj ponownie.')), 8000));
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    await pop3.QUIT();
    
    return { isValid: true };
  } catch (error: any) {
    try { await pop3.QUIT(); } catch (e) {}
    
    let errMsg = error?.message || String(error);
    if (errMsg.includes('SYS/PERM')) {
      errMsg = 'Włącz obsługę POP3 w ustawieniach Gmaila ("Włącz POP dla wszystkich wiadomości").';
    } else if (errMsg.includes('Invalid credentials') || errMsg.includes('login failed') || errMsg.includes('Web login required')) {
       errMsg = 'Nieprawidłowe hasło aplikacji lub błędny adres e-mail.';
    }
    
    return { isValid: false, error: errMsg };
  }
}
