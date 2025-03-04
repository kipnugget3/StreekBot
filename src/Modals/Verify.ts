import { EmbedBuilder, roleMention, TextInputStyle, userMention } from 'discord.js';
import nodemailer from 'nodemailer';
import { Modal, TextInput } from '../Structures';
import { encrypt, createMailOptions, getVerifyLogsChannel, getVerifyUser, getServerConfig } from '../Util';

export default new Modal()
    .setCustomId('verify')
    .setTitle('Verifieer jezelf')
    .addModalComponents(
        new TextInput()
            .setCustomId('student_number')
            .setLabel('Leerlingnummer')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Let op: dit leerlingnummer wordt ook gebruikt voor email verificatie.')
            .setMinLength(5)
            .setMaxLength(5)
    )
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const studentNumber = interaction.fields.getTextInputValue('student_number');

        const { client, user } = interaction;

        const { staffRoleId } = await getServerConfig(client);
        const verifyLogsChannel = await getVerifyLogsChannel(client);

        const email = `${studentNumber}@hetstreek.nl`;

        const studentNumberIsValid = !isNaN(Number(studentNumber));

        if (!studentNumberIsValid) {
            const embed = new EmbedBuilder()
                .setDescription(`Gebruik een geldig leerlingnummer.`)
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [embed] });
        }

        const verifyUserWithStudentNumber = await getVerifyUser(client, { leerlingnummer: studentNumber });

        if (verifyUserWithStudentNumber) {
            const logEmbed = new EmbedBuilder()
                .setDescription(
                    `${user} probeerde met leerlingnummer \`${studentNumber}\` te verifiëren. ` +
                        `Dit leerlingnummer is al gebruikt door ${userMention(verifyUserWithStudentNumber.userId)}.`
                )
                .setColor(client.config.color);

            await verifyLogsChannel.send({ content: roleMention(staffRoleId), embeds: [logEmbed] });

            const interactionEmbed = new EmbedBuilder()
                .setDescription(
                    `Dat leerlingnummer is al gebruikt! Staff is op de hoogte gebracht en zal contact met je opnemen.`
                )
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [interactionEmbed] });
        }

        await client.verificationCollection.insertOne({
            userId: user.id,
            leerlingnummer: studentNumber,
        });

        await interaction.editReply(
            `Verificatie 50% voltooid. Om te voltooien, kijk in je schoolmail en volg de instructies: \`${studentNumber}@hetstreek.nl\`.`
        );

        const logEmbed = new EmbedBuilder()
            .setDescription(`${user} heeft een email gekregen!`)
            .addFields({ name: 'Leerlingnummer', value: studentNumber })
            .setColor(client.config.color);

        await verifyLogsChannel.send({ embeds: [logEmbed] });

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

        Groetjes,
        Het Streek Discord team.`;

        const options = createMailOptions({ email, text });

        const res = await transporter.sendMail(options);

        client.logger.info(`Email sent: ${res.response}`);
    });
