import { setTimeout } from 'node:timers';
import { ButtonStyle, EmbedBuilder, Snowflake } from 'discord.js';
import nodemailer from 'nodemailer';
import { Button } from '../Structures';
import { encrypt, createMailOptions, getVerifyLogsChannel, getVerifyUser } from '../Util';

const cooldowns = new Map<Snowflake, number>();

export default new Button()
    .setCustomId('verify')
    .setLabel('Verify')
    .setStyle(ButtonStyle.Primary)
    .setCallback(async interaction => {
        // We cannot defer the reply here, because showing a modal after deferring the reply will not work.

        const { client, user } = interaction;

        const verifyLogsChannel = await getVerifyLogsChannel(client);

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

        const verifyUser = await getVerifyUser(client, { userId: interaction.user.id });

        if (verifyUser) {
            await interaction.reply({
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
            
            Link naar de Discord server: https://hetstreek.net. 

            Dit is niet de eerste keer dat we deze email sturen, als je hulp nodig hebt, klik op de "Hulp Nodig?" knop.
            
            Groetjes,
            Het Streek Discord team.`;

            const email = `${verifyUser.leerlingnummer}@hetstreek.nl`;

            await transporter.sendMail(createMailOptions({ email, text }));

            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${interaction.user} heeft de email nog een keer ontvangen.`);

            return verifyLogsChannel.send({ embeds: [embed] });
        }

        const modal = client.modals.get('verify', true);

        await interaction.showModal(modal);
    });
