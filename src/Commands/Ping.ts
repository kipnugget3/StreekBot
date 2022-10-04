import { EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';

//Command that returns the network latency to the user
export default new SlashCommand()
    .setName('ping')
    .setDescription('Bot ping.')
    .setCallback(async interaction => {
        await interaction.deferReply();

        const { client } = interaction;
        const embed = new EmbedBuilder().setDescription(`🏓 \`${client.ws.ping}ms\``).setColor(client.config.color);

        await interaction.editReply({ embeds: [embed] });
    });
