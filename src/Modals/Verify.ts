import { EmbedBuilder, GuildTextBasedChannel, roleMention, TextInputStyle, userMention } from 'discord.js';
import nodemailer from 'nodemailer';
import { throwVerifyLogsChannelNotFoundError } from '../Errors';
import { Modal, TextInput } from '../Structures';
import { mailOptions } from '../Util';

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
            .setMaxLength(5)
    )
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

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

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: client.config.verifyEmail,
                pass: client.config.verifyPassword,
            },
        });

        const options = mailOptions(studentNumber, user.id, client.config.encryptionKey);

        const res = await transporter.sendMail(options);

        client.logger.info(`Email sent: ${res.response}`);
    });
