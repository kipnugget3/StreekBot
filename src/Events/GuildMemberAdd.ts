import { EmbedBuilder, Events } from 'discord.js';
import { ClientEvent } from '../Structures';
import { formatMessage, getServerConfig, getWelcomeChannel } from '../Util';

export default new ClientEvent().setName(Events.GuildMemberAdd).setCallback(async member => {
    const { client, user } = member;

    const { welcomeMessages } = await getServerConfig(client);

    const welcomeChannel = await getWelcomeChannel(client);

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
        'Dit alles kan natuurlijk niet voor dat je geverifieerd bent, dat kan in <#984368582815273000>.';

    const dmEmbed = new EmbedBuilder().setTitle(title).setDescription(description).setTimestamp();

    await welcomeChannel.send({ embeds: [channelEmbed] });

    await member.send({ embeds: [dmEmbed] }).catch(() => null);
});
