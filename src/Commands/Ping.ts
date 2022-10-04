import { EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('ping')
    .setDescription('Bot ping.')
    .setCallback(async interaction => {
        await interaction.deferReply();

        const { client } = interaction;

        const embed = new EmbedBuilder().setDescription(`🏓 \`${client.ws.ping}ms\``).setColor(client.config.color);

        await interaction.editReply({ embeds: [embed] });
    });
