import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';

export interface FetchedEmail {
  pop3Uid: string; // we keep the name pop3Uid for DB backwards compatibility, but it will store IMAP UID
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  from: string;
  to: string;
  subject: string;
  text: string;
  date: Date;
}

const getImapClient = (email: string, appPassword: string) => {
  return new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: appPassword
    },
    logger: false, // Set to true for debugging if needed
    tls: { rejectUnauthorized: false }
  });
};

/**
 * Fetches unread emails via IMAP using ImapFlow.
 * Connects to imap.gmail.com:993
 * Skips UIDs that are already present in knownUids array.
 */
export async function fetchUnreadEmailsIMAP(email: string, appPassword: string, knownUids: string[]): Promise<FetchedEmail[]> {
  const client = getImapClient(email, appPassword);
  const fetchedEmails: FetchedEmail[] = [];

  // Zapobiega "unhandledRejection" gdy serwer (np. Google) nagle zerwie gniazdo
  client.on('error', err => {
    console.warn(`[Agent AI] Background IMAP Error (${email}):`, err.message);
  });

  try {
    // Timeout 15 sekund na samo połączenie IMAP
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
        try { client.close(); } catch(e) {}
        reject(new Error('IMAP connection timed out (Google ban active)'));
      }, 15000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    const lock = await client.getMailboxLock('INBOX');
    
    try {
      // Pobierz wiadomości z flagą UNSEEN (nieprzeczytane)
      // fetch() returns an async generator
      for await (let msg of client.fetch({ seen: false }, { source: true, uid: true })) {
        const uid = msg.uid.toString();
        
        if (knownUids.includes(uid)) continue;

        try {
          const parsed: any = await simpleParser(msg.source as Buffer);

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
          console.error(`[Agent AI] Błąd parsowania wiadomości IMAP UID ${uid}:`, err.message);
        }
      }
    } finally {
      lock.release();
    }
    
    if (client.usable) {
      client.close();
    }
  } catch (error: any) {
    console.error('[Agent AI] Błąd połączenia IMAP (ImapFlow):', error.message);
    try {
      client.close();
    } catch (e) {}
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
  const client = getImapClient(email, appPassword);
  client.on('error', () => {}); // ignore bg errors
  try {
    await client.connect();
    if (client.usable) await client.logout();
    return true;
  } catch (error) {
    try { if (client.usable) await client.logout(); } catch (e) {}
    return false;
  }
}

export async function validateImapCredentialsDetailed(email: string, appPassword: string): Promise<{isValid: boolean, error?: string}> {
  const client = getImapClient(email, appPassword);
  client.on('error', () => {}); // ignore bg errors
  
  try {
    const connectPromise = client.connect();
    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Przekroczono czas oczekiwania (Timeout). Serwery Google nie odpowiadają. Spróbuj ponownie.')), 10000));
    
    await Promise.race([connectPromise, timeoutPromise]);
    if (client.usable) await client.logout();
    
    return { isValid: true };
  } catch (error: any) {
    try { if (client.usable) await client.logout(); } catch (e) {}
    
    let errMsg = error?.message || String(error);
    
    if (errMsg.includes('Invalid credentials') || errMsg.includes('login failed') || errMsg.includes('Web login required') || errMsg.includes('AUTHENTICATIONFAILED')) {
       errMsg = 'Nieprawidłowe hasło aplikacji lub błędny adres e-mail.';
    } else if (errMsg.includes('IMAP')) {
       errMsg = 'Upewnij się, że włączyłeś IMAP w ustawieniach Gmaila.';
    }
    
    return { isValid: false, error: errMsg };
  }
}
