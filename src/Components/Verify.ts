import { setTimeout } from 'node:timers';

import { ButtonStyle, GuildTextBasedChannel, Snowflake } from 'discord.js';
import nodemailer from 'nodemailer';
import { Button } from '../Structures';
import { throwVerifyLogsChannelNotFoundError } from '../Errors';
import { encrypt, createMailOptions } from '../Util';

const cooldowns = new Map<Snowflake, number>();

export default new Button()
    .setCustomId('verify')
    .setLabel('Verify')
    .setStyle(ButtonStyle.Primary)
    .setCallback(async interaction => {
        // We cannot defer the reply here, because showing a modal after deferring the reply will not work.

        const { verifyLogsChannelId } = await interaction.client.getServerConfigSchema();

        const verifyLogsChannel = interaction.client.guilds.cache.get("927613222452858900")?.channels.cache.ensure(
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

            const { encryptionKey, verifyEmail, verifyPassword } = client.config;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: verifyEmail,
                    pass: verifyPassword,
                },
            });

            const encrypted = encrypt(user.id, encryptionKey);

            const text = `Hey leerling,
            
            We heten je van harte welkom op de (onofficiële) Het Streek Discord server. Om te voorkomen dat mensen in de server gaan zonder zichzelf te verifiëren, moet je eventjes op de link hieronder klikken om toegang tot alle kanalen te krijgen. Je hoeft niks te doen, je wordt automatisch geverifieerd.
            https://hetstreek.net/auth?content=${encrypted.content}&iv=${encrypted.iv}

            Door op deze link te klikken geef je Het Streek Discord toestemming om jouw Discord user ID en leerlingnummer op te slaan zolang je in de server zit. Je kan ten alle tijden je gegevens laten verwijderen door een developer.
            
            Let op! Als je deze link niet zelf hebt aangevraagd, verwijder deze email.
            
            Link naar de Discord server: <a href="https://hetstreek.net/">klik hier</a>. 

            Dit is niet de eerste keer dat we deze email sturen, als je hulp nodig hebt, klik op de "Hulp Nodig?" knop.
            
            Groetjes,
            Het Streek Discord team.`;

            const email = `${verifyUser.leerlingnummer}@hetstreek.nl`;

            await transporter.sendMail(createMailOptions({ email, text }));

            return verifyLogsChannel.send(`${interaction.user} heeft de email nog een keer ontvangen.`);
        }

        const modal = client.modals.get('verify', true);

        return interaction.showModal(modal);
    });
