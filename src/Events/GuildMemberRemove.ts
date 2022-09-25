import { EmbedBuilder, Events, GuildTextBasedChannel } from 'discord.js';
import { throwWelcomeChannelNotFoundError } from '../Errors';
import { ClientEvent } from '../Structures';
import { formatMessage } from '../Util';

export default new ClientEvent().setName(Events.GuildMemberRemove).setCallback(async member => {
    if (member.partial) return;

    const { client, guild, user } = member;

    const { welcomeChannelId, leaveMessages } = await client.getServerConfigSchema();

    await client.verificationCollection.deleteOne({ userId: user.id }).catch(() => null);

    const welcomeChannel = guild.channels.cache.ensure(
        welcomeChannelId,
        throwWelcomeChannelNotFoundError
    ) as GuildTextBasedChannel;

    if (!welcomeChannel) return;

    const leaveMessage = leaveMessages[Math.floor(Math.random() * leaveMessages.length)];

    if (!leaveMessage) return;

    const channelEmbed = new EmbedBuilder()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setTitle(`Tot ziens ${user.username}!`)
        .setDescription(formatMessage(leaveMessage, { member }))
        .setColor(client.config.color)
        .setTimestamp();

    await welcomeChannel.send({ embeds: [channelEmbed] });
});
