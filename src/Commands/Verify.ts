import { ActionRowBuilder, EmbedBuilder, GuildTextBasedChannel, MessageActionRowComponentBuilder } from 'discord.js';
import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('verify')
    .setDescription('Send the verify message.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommandGroup(group =>
        group
            .setName('message')
            .setDescription('Manage the verify message.')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('send')
                    .setDescription('Send the verify message.')
                    .addChannelOption(option =>
                        option.setName('channel').setDescription('The channel to send the message in.')
                    )
            )
    )
    .setCallback(async interaction => {
        await interaction.reply('Processing...');
        await interaction.deleteReply();

        const { client, options } = interaction;

        const channel = (options.getChannel('channel') as GuildTextBasedChannel) ?? interaction.channel;

        const embed = new EmbedBuilder()
            .setDescription('Om toegang tot de server te krijgen, klik op de knop onder dit bericht.')
            .setImage('https://i.imgur.com/zulMmYv.gif')
            .setColor(client.config.color);

        const verifyButton = client.components.getButton('verify', true);
        const helpButton = client.components.getButton('help', true);

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(verifyButton, helpButton);

        await channel.send({ embeds: [embed], components: [row] });
    });
