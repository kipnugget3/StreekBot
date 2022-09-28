import crypto from 'crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { EmbedBuilder, GuildTextBasedChannel, inlineCode, roleMention, TextInputStyle, userMention } from 'discord.js';
import nodemailer from 'nodemailer';
import { throwVerifyLogsChannelNotFoundError } from '../Errors';
import { Modal, TextInput } from '../Structures';
import { compareStrings } from '../Util';

export default new Modal()
    .setCustomId('verify')
    .setTitle('Verify jezelf.')
    .addModalComponents(
        new TextInput()
            .setCustomId('student_number')
            .setLabel('Leerlingnummer - Voor email verificatie')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Let op: dit nummer wordt ook gebruikt voor email verificatie.')
            .setMinLength(5)
            .setMaxLength(5),
        new TextInput()
            .setCustomId('name')
            .setLabel('Je voor- en achternaam')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(300)
            .setRequired(true)
    )
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.fields.getTextInputValue('name');
        const studentNumber = interaction.fields.getTextInputValue('student_number');

        const { client, guild, user } = interaction;

        const { staffRoleId, verifyLogsChannelId } = await client.getServerConfigSchema();

        const verifyLogsChannel = guild.channels.cache.ensure(
            verifyLogsChannelId,
            throwVerifyLogsChannelNotFoundError
        ) as GuildTextBasedChannel;

        const studentNumberIsValid =
            /^\d{5}$/.test(studentNumber) && parseInt(studentNumber) > 15_000 && parseInt(studentNumber) < 23_000;

        if (!studentNumberIsValid) {
            const embed = new EmbedBuilder()
                .setDescription(`Gebruik een geldig leerlingnummer.`)
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [embed] });
        }

        const verifyUsers = await client.verificationCollection.find().toArray();

        const verifyUserWithStudentNumber = verifyUsers.find(user => user.leerlingnummer === studentNumber);

        if (verifyUserWithStudentNumber) {
            const logEmbed = new EmbedBuilder()
                .setDescription(
                    `${user} probeerde met leerlingnummer \`${studentNumber}\` te verifiëren. ` +
                    `Dit leerlingnummer is al gebruikt door ${userMention(verifyUserWithStudentNumber.userId)}, ` +
                    `naam: ${inlineCode(verifyUserWithStudentNumber.naam)}!`
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

        const verifyUserWithName = verifyUsers.find(user =>
            compareStrings([user.naam.toLowerCase(), name.toLowerCase()], { ignoreCase: true })
        );

        if (verifyUserWithName) {
            const logEmbed = new EmbedBuilder()
                .setDescription(
                    `${user} probeerde met naam \`${name}\` te verifiëren. ` +
                    `Deze naam is al gebruikt door ${userMention(verifyUserWithName.userId)}, ` +
                    `leerlingnummer: ${inlineCode(verifyUserWithName.leerlingnummer)}!`
                )
                .setColor(client.config.color);

            await verifyLogsChannel.send({ content: roleMention(staffRoleId), embeds: [logEmbed] });

            const interactionEmbed = new EmbedBuilder()
                .setDescription(
                    `Die naam is al gebruikt! Staff is op de hoogte gebracht en zal contact met je opnemen.`
                )
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [interactionEmbed] });
        }

        await client.verificationCollection.insertOne({
            userId: user.id,
            naam: name,
            leerlingnummer: studentNumber,
        });

        await interaction.editReply(
            `Verificatie 50% voltooid. Om te voltooien, kijk in je schoolmail en volg de instructies: \`${studentNumber}@hetstreek.nl\`.`
        );

        const logEmbed = new EmbedBuilder()
            .setDescription(`${user} heeft een email gekregen!`)
            .addFields({ name: 'Leerlingnummer', value: studentNumber }, { name: 'Naam', value: name })
            .setColor(client.config.color);

        await verifyLogsChannel.send({ embeds: [logEmbed] });

        // Sending the email to the user.
        const algorithm = 'aes-256-ctr';
        const secretKey = `${process.env.KEY}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.VERIFY_EMAIL,
                pass: process.env.VERIFY_PASSWORD,
            },
        });

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
                text: `Hey ${naam},

                We heten je van harte welkom op de (onofficiële) Het Streek Discord server. Om te voorkomen dat mensen in de server gaan zonder met hun echte naam te verifiëren, moet je eventjes op de link hieronder klikken om toegang tot alle kanalen te krijgen. Je hoeft niks te doen, je wordt automatisch geverifieerd.
                https://hetstreek.net/auth?content=${encrypted.content}&iv=${encrypted.iv}
                
                Let op! Als je deze link niet zelf hebt aangevraagd, verwijder deze email.
                
                Groetjes,
                Het Streek Discord team.`,
            };
        };

        transporter.sendMail(await mailOptions(studentNumber, name, user.id), function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    });
