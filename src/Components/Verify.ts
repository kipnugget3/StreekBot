import crypto from 'crypto';
import { setTimeout } from 'node:timers';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { ButtonStyle, GuildTextBasedChannel, Snowflake } from 'discord.js';
import nodemailer from 'nodemailer';
import { Button } from '../Structures';
import { throwVerifyLogsChannelNotFoundError } from '../Errors';

const cooldowns = new Map<Snowflake, number>();

export default new Button()
    .setCustomId('verify')
    .setLabel('Verify')
    .setStyle(ButtonStyle.Primary)
    .setCallback(async interaction => {
        // We cannot defer the reply here, because showing a modal after deferring the reply will not work.

        const { verifyLogsChannelId } = await interaction.client.getServerConfigSchema();

        const verifyLogsChannel = interaction.guild.channels.cache.ensure(
            verifyLogsChannelId,
            throwVerifyLogsChannelNotFoundError
        ) as GuildTextBasedChannel;

        const { client, user } = interaction;

        const now = Date.now();
        const cooldownAmount = 10 * 60 * 1000;

        if (cooldowns.has(user.id)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const expiresTimestamp = cooldowns.get(user.id)! + cooldownAmount;

            if (now > expiresTimestamp) return cooldowns.delete(user.id);

            const timeLeftInSeconds = (expiresTimestamp - now) / 1000;

            return interaction.reply({
                content: `Please wait ${timeLeftInSeconds.toFixed(1)} more seconds before using that button!`,
                ephemeral: true,
            });
        }

        cooldowns.set(user.id, now);

        setTimeout(() => cooldowns.delete(user.id), cooldownAmount);

        const verifyUser = await client.verificationCollection.findOne({ userId: interaction.user.id });

        if (verifyUser) {
            interaction.reply({
                content:
                    'Je bent al in ons systeem! We hebben de email nog een keer naar je gestuurd, volg de instructies voor toegang! ' +
                    `Gebruikte email: \`${verifyUser.leerlingnummer}@hetstreek.nl\``,
                ephemeral: true,
            });

            const algorithm = 'aes-256-ctr';
            const secretKey = `${process.env.KEY}`;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.VERIFY_EMAIL,
                    pass: process.env.VERIFY_PASSWORD,
                },
            });

            verifyLogsChannel.send(`${interaction.user} heeft de email nog een keer ontvangen.`);

            const encrypt = (text: string) => {
                const iv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
                const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

                return {
                    iv: iv.toString('hex'),
                    content: encrypted.toString('hex'),
                };
            };

            const mailOptions = async (llnr: string, naam: string, userId: string) => {
                const encrypted = encrypt(userId);
                return {
                    from: 'verify.hetstreek@gmail.com',
                    to: `${llnr}@hetstreek.nl`,
                    subject: 'Voltooi je verificatie',
                    text: `Hey ${naam},\n\nWe heten je van harte welkom op de (onofficiële) Het Streek Discord server. Om te voorkomen dat mensen in de server gaan zonder met hun echte naam te verifiëren, moet je eventjes op de link hieronder klikken om toegang tot alle kanalen te krijgen. Je hoeft niks te doen, je wordt automatisch geverifieerd.\nhttps://hetstreek.net/auth?content=${encrypted.content}&iv=${encrypted.iv}\n\nLet op! Als je deze link niet zelf hebt aangevraagd, verwijder deze email.\n\nDit is niet de eerste keer dat we deze email sturen, als je hulp nodig hebt, klik op de "Hulp Nodig?" knop.\n\nGroetjes,\nHet Streek Discord team.`,
                };
            };

            transporter.sendMail(
                await mailOptions(verifyUser.leerlingnummer, verifyUser.naam, verifyUser.userId).catch(() => null)
            );
            return;
        }

        const modal = client.modals.get('verify', true);

        return interaction.showModal(modal);
    });
