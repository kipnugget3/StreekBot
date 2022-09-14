import { EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('welcome')
    .setDescription('Manages the welcome system.')
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

        const { config, serverConfigCollection } = interaction.client;

        const { _id, leaveMessages, welcomeMessages } = await interaction.client.getServerConfigSchema();

        const successEmbed = (description: string) =>
            new EmbedBuilder().setTitle('Success').setDescription(description).setColor(config.color);

        switch (group) {
            case 'messages': {
                switch (subcommand) {
                    case 'list': {
                        const embed = new EmbedBuilder()
                            .setTitle('Welcome Messages')
                            .addFields(welcomeMessages.map((msg, idx) => ({ name: `#${idx}`, value: msg })))
                            .setTimestamp();

                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'add': {
                        const message = interaction.options.getString('message', true);

                        await serverConfigCollection.updateOne({ _id }, { $push: { welcomeMessages: message } });

                        const embed = successEmbed('Welcome message successfully added.');

                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'remove': {
                        const index = interaction.options.getInteger('index', true);

                        welcomeMessages.splice(index, 1);

                        await serverConfigCollection.updateOne({ _id }, { $set: { welcomeMessages } });

                        const embed = successEmbed('Welcome message successfully removed.');

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
                            .addFields(leaveMessages.map((msg, idx) => ({ name: `#${idx}`, value: msg })))
                            .setTimestamp(0);

                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'add': {
                        const message = interaction.options.getString('message', true);

                        await serverConfigCollection.updateOne({ _id }, { $push: { leaveMessages: message } });

                        const embed = successEmbed('Leave message successfully added.');

                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'remove': {
                        const index = interaction.options.getInteger('index', true);

                        leaveMessages.splice(index, 1);

                        await serverConfigCollection.updateOne({ _id }, { $set: { leaveMessages } });

                        const embed = successEmbed('Leave message successfully removed.');

                        return interaction.editReply({ embeds: [embed] });
                    }
                    default:
                        return;
                }
            }
        }
    });
