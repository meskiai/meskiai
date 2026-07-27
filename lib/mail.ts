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
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: appPassword
    },
    logger: false,
    tls: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.logout();
    return true;
  } catch (error) {
    return false;
  }
}

export async function validateImapCredentialsDetailed(email: string, appPassword: string): Promise<{isValid: boolean, error?: string}> {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: appPassword
    },
    logger: false,
    tls: { rejectUnauthorized: false, family: 4 as any }
  });

  try {
    // Netlify functions time out at 10s. We enforce an 8s timeout here to leave 2s for response.
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Przekroczono czas oczekiwania (Timeout). Serwery Google nie odpowiadają. Spróbuj ponownie.')), 8000));
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    // Don't wait for logout if it hangs.
    client.logout().catch(() => {});
    client.close();
    
    return { isValid: true };
  } catch (error: any) {
    // If it fails or times out, close the connection forcefully
    client.close();
    return { isValid: false, error: error?.message || String(error) };
  }
}
