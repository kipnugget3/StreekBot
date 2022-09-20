import { EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('qotd')
    .setDescription('Manage the daily questions.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
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
    .addSubcommand(subcommand => subcommand.setName('list').setDescription('List all the daily questions.'))
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const { client, options } = interaction;

        const subcommand = options.getSubcommand(true);

        const { config, serverConfigCollection } = client;

        const { _id, dailyQuestions } = await client.getServerConfigSchema();

        const successEmbed = (description: string) =>
            new EmbedBuilder().setTitle('Success').setDescription(description).setColor(config.color);

        switch (subcommand) {
            case 'add': {
                const question = interaction.options.getString('question', true);

                await serverConfigCollection.updateOne({}, { $push: { dailyQuestions: question } });

                const embed = successEmbed('Daily question successfully added.');

                return interaction.editReply({ embeds: [embed] });
            }
            case 'remove': {
                const index = interaction.options.getInteger('index', true);

                dailyQuestions.splice(index, 1);

                await serverConfigCollection.updateOne({ _id }, { $set: { dailyQuestions } });

                const embed = successEmbed('Daily question successfully removed.');

                return interaction.editReply({ embeds: [embed] });
            }
            case 'list': {
                const embed = new EmbedBuilder()
                    .setTitle('Daily Questions')
                    .setTimestamp()
                    .addFields(dailyQuestions.map((msg, idx) => ({ name: `#${idx}`, value: msg })));

                return interaction.editReply({ embeds: [embed] });
            }
        }
    });
