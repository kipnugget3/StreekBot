import { ButtonStyle } from 'discord.js';
import { Button } from '../Structures';

export default new Button()
    .setCustomId('verify')
    .setLabel('Verify')
    .setStyle(ButtonStyle.Primary)
    .setCallback(interaction => {
        const modal = interaction.client.modals.get('verify', true);

        return interaction.showModal(modal);
    });
