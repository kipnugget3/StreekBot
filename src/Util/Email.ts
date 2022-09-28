import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

export const algorithm = 'aes-256-ctr';

export function encrypt(text: string, encryptionKey: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
    };
}

export function mailOptions(llnr: string, userId: string, encryptionKey: string) {
    const encrypted = encrypt(userId, encryptionKey);

    return {
        from: 'verify.hetstreek@gmail.com',
        to: `${llnr}@hetstreek.nl`,
        subject: 'Voltooi je verificatie',
        text: `Hey leerling,

        We heten je van harte welkom op de (onofficiële) Het Streek Discord server. Om te voorkomen dat mensen in de server gaan zonder met hun echte naam te verifiëren, moet je eventjes op de link hieronder klikken om toegang tot alle kanalen te krijgen. Je hoeft niks te doen, je wordt automatisch geverifieerd.
        https://hetstreek.net/auth?content=${encrypted.content}&iv=${encrypted.iv}
        
        Let op! Als je deze link niet zelf hebt aangevraagd, verwijder deze email.
        
        Groetjes,
        Het Streek Discord team.`,
    };
}
