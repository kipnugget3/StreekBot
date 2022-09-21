import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';
import { embedPages } from '../Util';

export default new SlashCommand()
    .setName('qotd')
    .setDescription('Manage the daily questions.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommand(subcommand => subcommand.setName('list').setDescription('List all the daily questions.'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a question to the daily questions.')
            .addStringOption(option =>
                option.setName('question').setDescription('The question to add.').setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Remove a question from the daily questions.')
            .addIntegerOption(option =>
                option.setName('index').setDescription('The index of the question to remove.').setRequired(true)
            )
    )
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const { client, options } = interaction;

        const subcommand = options.getSubcommand(true);

        const { config, serverConfigCollection } = client;

        const { _id, dailyQuestions } = await client.getServerConfigSchema();

        const successEmbed = (description: string) =>
            new EmbedBuilder().setTitle('Success').setDescription(description).setColor(config.color);

        switch (subcommand) {
            case 'list': {
                const embed = new EmbedBuilder().setTitle('Daily Questions').setTimestamp();

                const fields: APIEmbedField[] = dailyQuestions.map((msg, idx) => ({ name: `#${idx + 1}`, value: msg }));

                return embedPages(interaction, embed, fields);
            }
            case 'add': {
                const question = interaction.options.getString('question', true);

                await serverConfigCollection.updateOne({}, { $push: { dailyQuestions: question } });

                const embed = successEmbed('Daily question successfully added.');

                return interaction.editReply({ embeds: [embed] });
            }
            case 'remove': {
                const index = interaction.options.getInteger('index', true);

                if (index < 1 || index > dailyQuestions.length)
                    return interaction.editReply('Please provide a valid index.');

                dailyQuestions.splice(index - 1, 1);

                await serverConfigCollection.updateOne({ _id }, { $set: { dailyQuestions } });

                const embed = successEmbed('Daily question successfully removed.');

                return interaction.editReply({ embeds: [embed] });
            }
        }
    });
