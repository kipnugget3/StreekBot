import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import type { SendMailOptions } from 'nodemailer';

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

interface CreateMailOptionsData {
    leerlingnummer: string;
    text: string;
}

export function createMailOptions(data: CreateMailOptionsData): SendMailOptions;
export function createMailOptions({ leerlingnummer, text }: CreateMailOptionsData) {
    return {
        from: 'verify.hetstreek@gmail.com',
        to: `${leerlingnummer}@hetstreek.nl`,
        subject: 'Voltooi je verificatie',
        text,
    };
}
