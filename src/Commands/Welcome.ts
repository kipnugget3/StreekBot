import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';
import { embedPages, getServerConfig } from '../Util';

export default new SlashCommand()
    .setName('welcome')
    .setDescription('Manages the welcome system.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommandGroup(group =>
        group
            .setName('messages')
            .setDescription('Manage welcome messages')
            .addSubcommand(subcommand => subcommand.setName('list').setDescription('Lists all welcome messages'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Adds a new welcome message')
                    .addStringOption(option =>
                        option.setName('message').setDescription('The message to add').setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Removes a welcome message')
                    .addIntegerOption(option =>
                        option.setName('index').setDescription('The index of the message to remove').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('leave-messages')
            .setDescription('Manage leave messages')
            .addSubcommand(subcommand => subcommand.setName('list').setDescription('Lists all leave messages'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Adds a new leave message')
                    .addStringOption(option =>
                        option.setName('message').setDescription('The message to add').setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Removes a leave message')
                    .addIntegerOption(option =>
                        option.setName('index').setDescription('The index of the message to remove').setRequired(true)
                    )
            )
    )
    .setCallback(async interaction => {
        await interaction.deferReply();

        const group = interaction.options.getSubcommandGroup(true);
        const subcommand = interaction.options.getSubcommand(true);

        const { client } = interaction;
        const { config, serverConfigCollection } = client;

        const { _id, leaveMessages, welcomeMessages } = await getServerConfig(client);

        switch (group) {
            case 'messages': {
                switch (subcommand) {
                    case 'list': {
                        const embed = new EmbedBuilder()
                            .setTitle('Welcome Messages')
                            .setColor(config.color)
                            .setTimestamp();

                        const fields: APIEmbedField[] = welcomeMessages.map((msg, idx) => ({
                            name: `#${idx + 1}`,
                            value: msg,
                        }));

                        if (!fields.length)
                            return interaction.editReply({
                                embeds: [embed.setDescription('No welcome messages found.')],
                            });

                        return embedPages(interaction, embed, fields);
                    }
                    case 'add': {
                        const message = interaction.options.getString('message', true);

                        await serverConfigCollection.updateOne({ _id }, { $push: { welcomeMessages: message } });

                        const embed = new EmbedBuilder()
                            .setTitle('Welcome Message Added')
                            .setDescription(message)
                            .setColor(config.color);

                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'remove': {
                        const index = interaction.options.getInteger('index', true);

                        if (index < 1 || index > welcomeMessages.length)
                            return interaction.editReply('Please provide a valid index.');

                        const message = welcomeMessages.splice(index - 1, 1)[0];

                        await serverConfigCollection.updateOne({ _id }, { $set: { welcomeMessages } });

                        const embed = new EmbedBuilder()
                            .setTitle('Welcome Message Removed')
                            .setDescription(message)
                            .setColor(config.color);

                        return interaction.editReply({ embeds: [embed] });
                    }
                    default:
                        return;
                }
            }
            case 'leave-messages': {
                switch (subcommand) {
                    case 'list': {
                        const embed = new EmbedBuilder()
                            .setTitle('Leave Messages')
                            .setColor(config.color)
                            .setTimestamp();

                        const fields: APIEmbedField[] = leaveMessages.map((msg, idx) => ({
                            name: `#${idx + 1}`,
                            value: msg,
                        }));

                        if (!fields.length)
                            return interaction.editReply({
                                embeds: [embed.setDescription('No leave messages found.')],
                            });

                        return embedPages(interaction, embed, fields);
                    }
                    case 'add': {
                        const message = interaction.options.getString('message', true);

                        await serverConfigCollection.updateOne({ _id }, { $push: { leaveMessages: message } });

                        const embed = new EmbedBuilder()
                            .setTitle('Leave Message Added')
                            .setDescription(message)
                            .setColor(config.color);

                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'remove': {
                        const index = interaction.options.getInteger('index', true);

                        if (index < 1 || index > leaveMessages.length)
                            return interaction.editReply('Please provide a valid index.');

                        const message = leaveMessages.splice(index - 1, 1)[0];

                        await serverConfigCollection.updateOne({ _id }, { $set: { leaveMessages } });

                        const embed = new EmbedBuilder()
                            .setTitle('Leave Message Removed')
                            .setDescription(message)
                            .setColor(config.color);

                        return interaction.editReply({ embeds: [embed] });
                    }
                    default:
                        return;
                }
            }
        }
    });
