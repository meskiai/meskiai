import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import Pop3Command from 'node-pop3';

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
/**
 * Fetches emails via POP3.
 * Connects to pop.gmail.com:995
 * Skips UIDs that are already present in knownUids array.
 */
export async function fetchUnreadEmailsPOP3(email: string, appPassword: string, knownUids: string[]): Promise<FetchedEmail[]> {
  const pop3 = new Pop3Command({
    user: email,
    password: appPassword,
    host: 'pop.gmail.com',
    port: 995,
    tls: true
  });
  
  const fetchedEmails: FetchedEmail[] = [];

  try {
    // Timeout 15 sekund na pobranie całej listy POP3
    let timeoutId: any;
    const connectPromise = pop3.UIDL();
    const timeoutPromise = new Promise<any>((_, reject) => 
      timeoutId = setTimeout(() => {
        try { pop3.QUIT(); } catch(e) {}
        reject(new Error('POP3 connection timed out (Google ban active)'));
      }, 15000)
    );
    
    // Zwraca tablicę: [ [1, "uid1"], [2, "uid2"] ]
    const uidlList = await Promise.race([connectPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    
    // Szukamy nowych UID
    for (const item of uidlList) {
      if (!item || item.length < 2) continue;
      const msgNum = item[0];
      const uid = item[1];
      
      if (knownUids.includes(uid)) continue;
      
      try {
        const rawMsg = await pop3.RETR(msgNum);
        const parsed: any = await simpleParser(rawMsg);
        
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
        console.error(`[Agent AI] Błąd parsowania wiadomości POP3 UID ${uid}:`, err.message);
      }
    }
    
    try {
      await pop3.QUIT();
    } catch(e) {}
    
  } catch (error: any) {
    console.error('[Agent AI] Błąd połączenia POP3:', error.message);
    try { pop3.QUIT(); } catch (e) {}
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
 * Validates POP3 credentials by attempting a connection.
 */
export async function validatePop3Credentials(email: string, appPassword: string): Promise<boolean> {
  const pop3 = new Pop3Command({ user: email, password: appPassword, host: 'pop.gmail.com', port: 995, tls: true });
  try {
    await pop3.UIDL();
    try { await pop3.QUIT(); } catch(e) {}
    return true;
  } catch (error) {
    try { await pop3.QUIT(); } catch(e) {}
    return false;
  }
}

export async function validatePop3CredentialsDetailed(email: string, appPassword: string): Promise<{isValid: boolean, error?: string}> {
  const pop3 = new Pop3Command({ user: email, password: appPassword, host: 'pop.gmail.com', port: 995, tls: true });
  
  try {
    let timeoutId: any;
    const connectPromise = pop3.UIDL();
    const timeoutPromise = new Promise<any>((_, reject) => 
      timeoutId = setTimeout(() => reject(new Error('Przekroczono czas oczekiwania (Timeout). Serwery Google nie odpowiadają. Spróbuj ponownie.')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    
    try { await pop3.QUIT(); } catch(e) {}
    
    return { isValid: true };
  } catch (error: any) {
    try { await pop3.QUIT(); } catch (e) {}
    
    let errMsg = error?.message || String(error);
    
    if (errMsg.includes('Invalid credentials') || errMsg.includes('login failed') || errMsg.includes('Username and password not accepted') || errMsg.includes('Web login required') || errMsg.includes('AUTH')) {
       errMsg = 'Nieprawidłowe hasło aplikacji lub błędny adres e-mail.';
    } else if (errMsg.includes('POP3')) {
       errMsg = 'Wystąpił błąd protokołu POP3.';
    }
    
    return { isValid: false, error: errMsg };
  }
}
