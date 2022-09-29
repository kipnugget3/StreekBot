import { EmbedBuilder, Events } from 'discord.js';
import { ClientEvent } from '../Structures';
import { formatMessage, getWelcomeChannel } from '../Util';

export default new ClientEvent().setName(Events.GuildMemberRemove).setCallback(async member => {
    if (member.partial) return;

    const { client, user } = member;

    const { leaveMessages } = await client.getServerConfigSchema();

    await client.verificationCollection.deleteOne({ userId: user.id }).catch(() => null);

    const welcomeChannel = await getWelcomeChannel(client);

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
