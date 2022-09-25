import { EmbedBuilder, Events, GuildTextBasedChannel } from 'discord.js';
import { throwWelcomeChannelNotFoundError } from '../Errors';
import { ClientEvent } from '../Structures';
import { formatMessage } from '../Util';

export default new ClientEvent().setName(Events.GuildMemberAdd).setCallback(async member => {
    const { client, guild, user } = member;

    const { welcomeChannelId, welcomeMessages } = await client.getServerConfigSchema();

    const welcomeChannel = guild.channels.cache.ensure(
        welcomeChannelId,
        throwWelcomeChannelNotFoundError
    ) as GuildTextBasedChannel;

    if (!welcomeChannel) return;

    const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    if (!welcomeMessage) return;

    const channelEmbed = new EmbedBuilder()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setTitle(`Welkom ${user.username}!`)
        .setDescription(formatMessage(welcomeMessage, { member }))
        .setColor(client.config.color)
        .setTimestamp();

    const title = `Welkom ${user.username}!`;
    const description =
        'Welkom op de Het Streek Discord. ' +
        'Check de regels in <#985829312513052702>, ' +
        'start met kletsen in <#985824218476343306> en claim je rollen in <#985824313045291049>! ' +
        'Dit alles kan natuurlijk niet voor dat je geverifieërd bent, dat kan in <#984368582815273000>.';

    const dmEmbed = new EmbedBuilder().setTitle(title).setDescription(description).setTimestamp();

    await welcomeChannel.send({ embeds: [channelEmbed] });

    await member.send({ embeds: [dmEmbed] }).catch(() => null);
});
