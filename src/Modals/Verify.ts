import { EmbedBuilder, GuildTextBasedChannel, inlineCode, roleMention, TextInputStyle, userMention } from 'discord.js';
import { throwVerifyLogsChannelNotFoundError } from '../Errors';
import { Modal, TextInput } from '../Structures';
import { compareStrings } from '../Util';

export default new Modal()
    .setCustomId('verify')
    .setTitle('Verify jezelf.')
    .addModalComponents(
        new TextInput()
            .setCustomId('name')
            .setLabel('Je voor- en achternaam')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(300)
            .setRequired(true),
        new TextInput()
            .setCustomId('student_number')
            .setLabel('Leerlingnummer')
            .setStyle(TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(5)
    )
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.fields.getTextInputValue('name');
        const studentNumber = interaction.fields.getTextInputValue('student_number');

        const { client, guild, member, user } = interaction;

        const { staffRoleId, verifiedRoleId, verifyLogsChannelId } = await client.getServerConfigSchema();

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

        await member.roles.add(verifiedRoleId);

        await interaction.editReply('Je bent nu geverifieerd!');

        const logEmbed = new EmbedBuilder()
            .setDescription(`${user} is geverifieerd!`)
            .addFields({ name: 'Leerlingnummer', value: studentNumber }, { name: 'Naam', value: name })
            .setColor(client.config.color);

        await verifyLogsChannel.send({ embeds: [logEmbed] });
    });
