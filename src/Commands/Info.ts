import os from 'node:os';
import process from 'node:process';
import { Client, codeBlock, EmbedBuilder, inlineCode, time, TimestampStyles } from 'discord.js';
import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('info')
    .setDescription('Bot info.')
    .setCallback(async interaction => {
        await interaction.deferReply();

        const client = interaction.client as Client<true>;

        const totalMemoryMB = Math.round(os.totalmem() / 1024 / 1024);
        const freeMemoryMB = Math.round(os.freemem() / 1024 / 1024);
        const usedMemoryMB = totalMemoryMB - freeMemoryMB;
        const uptime = time(client.readyAt, TimestampStyles.RelativeTime);

        const userCount = client.users.cache.size.toString();
        const guildCount = client.guilds.cache.size.toString();

        const djsVersion = require('../../package.json').dependencies['discord.js'];
        const nodeVersion = process.version;

        const cpu = os.cpus()[0].model;
        const { version } = require('../../package.json');

        const { platform } = process;
        const ping = `${client.ws.ping}ms`;

        const invisibleField = { name: '\u200B', value: '\u200B', inline: true };

        const embed = new EmbedBuilder()
            .setTitle(`${client.user.username} Info`)
            .setThumbnail(client.user.avatarURL())
            .setColor(client.config.color)
            .addFields(
                { name: 'Memory Usage', value: inlineCode(`${usedMemoryMB}MB/${totalMemoryMB}MB`), inline: true },
                { name: 'Uptime', value: uptime, inline: true },
                invisibleField,

                { name: 'Users', value: inlineCode(userCount), inline: true },
                { name: 'Servers', value: inlineCode(guildCount), inline: true },
                invisibleField,

                { name: 'Discord.js', value: inlineCode(djsVersion), inline: true },
                { name: 'Node.js', value: inlineCode(nodeVersion), inline: true },
                invisibleField,

                { name: 'CPU', value: codeBlock(cpu), inline: true },
                { name: 'Version', value: inlineCode(version), inline: true },
                invisibleField,

                { name: 'Platform', value: inlineCode(platform), inline: true },
                { name: 'Ping', value: inlineCode(ping), inline: true },
                invisibleField
            );

        await interaction.editReply({ embeds: [embed] });
    });
