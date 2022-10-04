import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';
import { embedPages, getServerConfig } from '../Util';

//Command for managing daily questions
export default new SlashCommand()
    .setName('qotd')
    .setDescription('Manage the daily questions.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommand(subcommand => 
        //Subcommand to list all current questions
        subcommand.setName('list').setDescription('List all the daily questions.'))
    .addSubcommand(subcommand =>
        //subcommand to add questions
        subcommand
            .setName('add')
            .setDescription('Add a question to the daily questions.')
            .addStringOption(option =>
                option.setName('question').setDescription('The question to add.').setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        //Subcommand to remove questions
        subcommand
            .setName('remove')
            .setDescription('Remove a question from the daily questions.')
            .addIntegerOption(option =>
                option.setName('index').setDescription('The index of the question to remove.').setRequired(true)
            )
    )
    .setCallback(async interaction => {
        await interaction.deferReply();

        const { client, options } = interaction;
        const subcommand = options.getSubcommand(true);
        const { config, serverConfigCollection } = client;
        const { _id, dailyQuestions } = await getServerConfig(client);

        switch (subcommand) {
            //returns a list of the questions
            case 'list': {
                const embed = new EmbedBuilder().setTitle('Daily Questions').setTimestamp();
                const fields: APIEmbedField[] = dailyQuestions.map((msg, idx) => ({ name: `#${idx + 1}`, value: msg }));

                if (!fields.length)
                    return interaction.editReply({ embeds: [embed.setDescription('No daily question found.')] });

                return embedPages(interaction, embed, fields);
            }
            //Adds a question to the daily questions array
            case 'add': {
                const question = interaction.options.getString('question', true);

                await serverConfigCollection.updateOne({ _id }, { $push: { dailyQuestions: question } });

                const embed = new EmbedBuilder()
                    .setTitle('Daily Question Added')
                    .setDescription(question)
                    .setColor(config.color);

                return interaction.editReply({ embeds: [embed] });
            }
            //remove a question indicated by index number from the dailyquestions array. 
            case 'remove': {
                const index = interaction.options.getInteger('index', true);

                if (index < 1 || index > dailyQuestions.length)
                    return interaction.editReply('Please provide a valid index.');

                const question = dailyQuestions.splice(index - 1, 1)[0];

                await serverConfigCollection.updateOne({ _id }, { $set: { dailyQuestions } });

                const embed = new EmbedBuilder()
                    .setTitle('Daily Question Removed')
                    .setDescription(question)
                    .setColor(config.color);

                return interaction.editReply({ embeds: [embed] });
            }
        }
    });
