import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Szyfruje tekst za pomocą AES-256-GCM.
 * Jeśli nie przekazano ENCRYPTION_SECRET, użyje NEXTAUTH_SECRET jako fallbacku.
 * Zwraca formacie: base64(salt):base64(iv):base64(authTag):base64(encryptedData)
 */
export function encrypt(text: string | null | undefined): string | null {
    if (!text) return text as any;
    try {
        const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret_must_change";
        const iv = crypto.randomBytes(IV_LENGTH);
        const salt = crypto.randomBytes(SALT_LENGTH);
        const key = crypto.scryptSync(secret, salt, 32);
        
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const tag = cipher.getAuthTag();
        
        return `${salt.toString('base64')}:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
    } catch(e) {
        console.error("[Crypto] Encryption failed", e);
        return text;
    }
}

/**
 * Rozszyfrowuje tekst.
 * Mechanizm fallbackowy: jeśli tekst nie wygląda na zaszyfrowany, 
 * zwraca go w oryginalnej formie, umożliwiając łagodne przejście (backward compatibility).
 */
export function decrypt(encryptedText: string | null | undefined): string | null {
    if (!encryptedText) return encryptedText as any;
    
    // Prosta heurystyka formatu szyfrowanego (naszego) - 4 części oddzielone :
    if (!encryptedText.includes(':')) return encryptedText;
    
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 4) return encryptedText; 
        
        const [salt64, iv64, tag64, data64] = parts;
        const salt = Buffer.from(salt64, 'base64');
        const iv = Buffer.from(iv64, 'base64');
        const tag = Buffer.from(tag64, 'base64');
        
        const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret_must_change";
        const key = crypto.scryptSync(secret, salt, 32);
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(data64, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch(e) {
        console.warn("[Crypto] Decryption failed, falling back to plain text. Probably it was plain text that happened to contain a colon.", e);
        return encryptedText;
    }
}
