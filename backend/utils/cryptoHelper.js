import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module වලදී .env load කරගැනීමට අවශ්‍යයි (Backend root එකේ ඇති .env සොයාගැනීමට)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') }); 

const ALGORITHM = 'aes-256-cbc';

// Key එක අනිවාර්යයෙන්ම 32 bytes විය යුතුයි. 
// යම් හෙයකින් .env එකේ නැතිනම් fallback එකක් ලෙස string එකක් දමා එය 32 bytes වලට pad කරමු.
const rawKey = process.env.ENCRYPTION_KEY || 'a_very_secure_default_32_char_key';
const ENCRYPTION_KEY = Buffer.alloc(32, rawKey, 'utf8'); // මෙය අනිවාර්යයෙන්ම 32 bytes කරයි

const IV_LENGTH = 16;

export const encrypt = (text) => {
    try {
        if (!text) return null;

        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error("ENCRYPTION ERROR:", error.message);
        throw error;
    }
};

export const decrypt = (text) => {
    try {
        if (!text || !text.includes(':')) return text;

        const [ivHex, encryptedHex] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error("DECRYPTION ERROR:", error.message);
        return text;
    }
};