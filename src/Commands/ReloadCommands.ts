import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('reload-commands')
    .setDescription('Reload de commands van de bot')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const { client } = interaction;
        await client.commands.deployAll();

        await interaction.editReply({ content: 'Application commands deployed successfully.' });
    });
