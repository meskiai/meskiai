import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import imaps from 'imap-simple';

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

const getImapConfig = (email: string, appPassword: string) => ({
  imap: {
    user: email,
    password: appPassword,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
  }
});

/**
 * Fetches unread emails via IMAP.
 * Connects to imap.gmail.com:993
 * Skips UIDs that are already present in knownUids array.
 */
export async function fetchUnreadEmailsIMAP(email: string, appPassword: string, knownUids: string[]): Promise<FetchedEmail[]> {
  const config = getImapConfig(email, appPassword);
  
  let connection;
  const fetchedEmails: FetchedEmail[] = [];

  try {
    connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    // Fetch emails from the last 7 days to avoid fetching entire history,
    // or fetch UNSEEN. Let's fetch UNSEEN.
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
      struct: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const item of messages) {
      const uid = item.attributes.uid.toString();
      
      if (knownUids.includes(uid)) continue;

      const all = item.parts.find((part: any) => part.which === '');
      const idHeader = "Imap-Id: " + item.attributes.uid + "\r\n";
      
      try {
        const bodyContent = all ? all.body : '';
        const parsed = await simpleParser(idHeader + bodyContent);

        const fromAddr = parsed.from?.value?.[0]?.address || parsed.from?.text || '';
        const toObj = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
        const toAddr = toObj?.value?.[0]?.address || toObj?.text || email;
        const messageId = parsed.messageId || `uid-${uid}-${Date.now()}`;

        let inReplyTo = parsed.inReplyTo;
        if (Array.isArray(inReplyTo)) inReplyTo = inReplyTo[0];

        let references = parsed.references;
        if (typeof references === 'string') references = [references];

        fetchedEmails.push({
          pop3Uid: uid, // Keeping the field name pop3Uid for DB compat
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
    
    connection.end();
  } catch (error: any) {
    console.error('[Agent AI] Błąd połączenia IMAP:', error);
    if (connection) connection.end();
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
  try {
    const connection = await imaps.connect(getImapConfig(email, appPassword));
    connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

export async function validateImapCredentialsDetailed(email: string, appPassword: string): Promise<{isValid: boolean, error?: string}> {
  try {
    const connectPromise = imaps.connect(getImapConfig(email, appPassword));
    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Przekroczono czas oczekiwania (Timeout). Serwery Google nie odpowiadają. Spróbuj ponownie.')), 10000));
    
    const connection = await Promise.race([connectPromise, timeoutPromise]);
    connection.end();
    
    return { isValid: true };
  } catch (error: any) {
    let errMsg = error?.message || String(error);
    
    if (errMsg.includes('Invalid credentials') || errMsg.includes('login failed') || errMsg.includes('Web login required') || errMsg.includes('AUTHENTICATIONFAILED')) {
       errMsg = 'Nieprawidłowe hasło aplikacji lub błędny adres e-mail.';
    } else if (errMsg.includes('IMAP')) {
       errMsg = 'Upewnij się, że włączyłeś IMAP w ustawieniach Gmaila.';
    }
    
    return { isValid: false, error: errMsg };
  }
}
