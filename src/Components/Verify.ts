import { ButtonStyle } from 'discord.js';
import { Button } from '../Structures';

export default new Button()
    .setCustomId('verify')
    .setLabel('Verify')
    .setStyle(ButtonStyle.Primary)
    .setCallback(async interaction => {
        // We cannot defer the reply here, because showing a modal after deferring the reply will not work.

        const { client, member } = interaction;

        const verifyUser = await client.verificationCollection.findOne({ userId: interaction.user.id });

        if (verifyUser) {
            const { verifiedRoleId } = await client.getServerConfigSchema();

            await member.roles.add(verifiedRoleId);

            return interaction.reply({ content: 'Je bent nu geverifieerd!', ephemeral: true });
        }

        const modal = client.modals.get('verify', true);

        return interaction.showModal(modal);
    });
