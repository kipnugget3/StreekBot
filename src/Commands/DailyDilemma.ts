import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';
import { embedPages } from '../Util';

export default new SlashCommand()
    .setName('daily-dilemma')
    .setDescription("Manage the daily dilemma's.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommand(subcommand => subcommand.setName('list').setDescription("List all the daily dilemma's."))
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription("Add a dilemma to the daily dilemma's.")
            .addStringOption(option =>
                option.setName('dilemma').setDescription('The dilemma to add.').setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription("Remove a dilemma from the daily dilemma's.")
            .addIntegerOption(option =>
                option.setName('index').setDescription('The index of the dilemma to remove.').setRequired(true)
            )
    )
    .setCallback(async interaction => {
        await interaction.deferReply();

        const { client, options } = interaction;
        const subcommand = options.getSubcommand(true);
        const { config, serverConfigCollection } = client;
        const { _id, dailyDilemmas } = await client.getServerConfigSchema();

        switch (subcommand) {
            case 'list': {
                const embed = new EmbedBuilder().setTitle('Daily Dilemma').setTimestamp();
                const fields: APIEmbedField[] = dailyDilemmas.map((msg, idx) => ({ name: `#${idx + 1}`, value: msg }));

                return embedPages(interaction, embed, fields);
            }
            case 'add': {
                const dilemma = interaction.options.getString('dilemma', true);

                await serverConfigCollection.updateOne({ _id }, { $push: { dailyDilemmas: dilemma } });

                const embed = new EmbedBuilder()
                    .setTitle('Daily Dilemma Added')
                    .setDescription(dilemma)
                    .setColor(config.color);

                return interaction.editReply({ embeds: [embed] });
            }
            case 'remove': {
                const index = interaction.options.getInteger('index', true);

                if (index < 1 || index > dailyDilemmas.length)
                    return interaction.editReply('Please provide a valid index.');

                const dilemma = dailyDilemmas.splice(index - 1, 1)[0];

                await serverConfigCollection.updateOne({ _id }, { $set: { dailyDilemmas } });

                const embed = new EmbedBuilder()
                    .setTitle('Daily Question Removed')
                    .setDescription(dilemma)
                    .setColor(config.color);

                return interaction.editReply({ embeds: [embed] });
            }
        }
    });
