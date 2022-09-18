import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('reload-commands')
    .setDescription('Reload application commands.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        await interaction.client.commands.deployAll();

        await interaction.editReply('Application commands deployed successfully.');
    });
