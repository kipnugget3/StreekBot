import {
    ActionRowBuilder,
    EmbedBuilder,
    GuildTextBasedChannel,
    inlineCode,
    MessageActionRowComponentBuilder,
    roleMention,
    TextInputStyle,
    userMention,
} from 'discord.js';
import {
    throwVerifiedRoleNotFoundError,
    throwVerifyErrorsChannelNotFoundError,
    throwVerifyLogsChannelNotFoundError,
} from '../Errors';
import { Modal, TextInput } from '../Structures';

export default new Modal()
    .setCustomId('verify')
    .setTitle('Verify jezelf.')
    .addModalComponents(
        new TextInput()
            .setCustomId('naam')
            .setLabel('Je voornaam en achternaam')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(300)
            .setRequired(true),
        new TextInput()
            .setCustomId('leerlingnummer')
            .setLabel('Leerlingnummer')
            .setStyle(TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(5)
    )
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const naam = interaction.fields.getTextInputValue('naam');
        const leerlingnummer = interaction.fields.getTextInputValue('leerlingnummer');

        const { client, guild, member, user } = interaction;

        const { staffRoleId, verifiedRoleId, verifyErrorsChannelId, verifyLogsChannelId } =
            await client.getServerConfigSchema();

        const verifiedRole = guild.roles.cache.ensure(verifiedRoleId, throwVerifiedRoleNotFoundError);

        const verifyErrorsChannel = guild.channels.cache.ensure(
            verifyErrorsChannelId,
            throwVerifyErrorsChannelNotFoundError
        ) as GuildTextBasedChannel;

        const verifyLogsChannel = guild.channels.cache.ensure(
            verifyLogsChannelId,
            throwVerifyLogsChannelNotFoundError
        ) as GuildTextBasedChannel;

        if (!/^\d{5}$/.test(leerlingnummer)) {
            const embed = new EmbedBuilder()
                .setDescription(`Gebruik een geldig leerlingnummer.`)
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [embed] });
        }

        const verifyUsers = await client.verificationCollection.find().toArray();

        const verifyUserWithUserId = verifyUsers.find(u => u.userId === user.id);

        if (verifyUserWithUserId) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `Je bent al verified! Je bent verified met leerlingnummer \`${verifyUserWithUserId.leerlingnummer}\` en naam \`${verifyUserWithUserId.naam}\``
                )
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [embed] });
        }

        const verifyUserWithStudentnumber = verifyUsers.find(user => user.leerlingnummer === leerlingnummer);

        if (parseInt(leerlingnummer) > 24000 || parseInt(leerlingnummer) < 15000) {
            const embed = new EmbedBuilder()
                .setDescription(`Gebruik een geldig leerlingnummer.`)
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [embed] });
        }

        if (verifyUserWithStudentnumber) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `${user} probeerde met leerlingnummer \`${leerlingnummer}\` te verifiëren. ` +
                        `Dit leerlingnummer is al gebruikt door ${userMention(verifyUserWithStudentnumber.userId)}, ` +
                        `naam: ${inlineCode(verifyUserWithStudentnumber.naam)}!`
                )
                .setColor(client.config.color);

            await verifyErrorsChannel.send({ content: roleMention(staffRoleId), embeds: [embed] });

            const interactionEmbed = new EmbedBuilder()
                .setDescription(
                    `Dat leerlingnummer is al gebruikt! Staff is op de hoogte gebracht en zal contact met je opnemen.`
                )
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [interactionEmbed] });
        }

        const verifyUserWithName = verifyUsers.find(user => user.naam.toLowerCase() === naam.toLowerCase());

        if (verifyUserWithName) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `${user} probeerde met naam \`${naam}\` te verifiëren. ` +
                        `Deze naam is al gebruikt door ${userMention(verifyUserWithName.userId)}, ` +
                        `leerlingnummer: ${inlineCode(verifyUserWithName.leerlingnummer)}!`
                )
                .setColor(client.config.color);

            await verifyErrorsChannel.send({ content: roleMention(staffRoleId), embeds: [embed] });

            const interactionEmbed = new EmbedBuilder()
                .setDescription(
                    `Die naam is al gebruikt! Staff is op de hoogte gebracht en zal contact met je opnemen.`
                )
                .setColor(client.config.color);

            return interaction.editReply({ embeds: [interactionEmbed] });
        }

        await client.verificationCollection.insertOne({
            userId: user.id,
            naam,
            leerlingnummer,
        });

        await member.roles.add(verifiedRole);

        await interaction.editReply('You are now verified.');

        const embed = new EmbedBuilder()
            .setDescription(`${user} is geverifieërd!`)
            .addFields({ name: 'Leerlingnummer', value: leerlingnummer }, { name: 'Naam', value: naam })
            .setColor(client.config.color);

        const dismissButton = client.components.getButton('dismiss', true);
        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(dismissButton);

        await verifyLogsChannel.send({ embeds: [embed], components: [row] });
    });
