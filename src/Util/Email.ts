import { Buffer } from 'node:buffer';
import { createCipheriv, randomBytes } from 'node:crypto';
import type { SendMailOptions } from 'nodemailer';

export const algorithm = 'aes-256-ctr';

export function encrypt(text: string, encryptionKey: string) {
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
    };
}

interface CreateMailOptionsData {
    email: string;
    text: string;
}

export function createMailOptions(data: CreateMailOptionsData): SendMailOptions;
export function createMailOptions({ email, text }: CreateMailOptionsData) {
    return {
        from: 'verify.hetstreek@gmail.com',
        to: email,
        subject: 'Voltooi je verificatie',
        text: text
            .split('\n')
            .map(line => line.trim())
            .join('\n'),
    };
}
