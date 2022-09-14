import { EmbedBuilder, Events, GuildTextBasedChannel } from 'discord.js';
import { ClientEvent } from '../Structures';

export default new ClientEvent({
    name: Events.GuildMemberAdd,
    run: async member => {
        const { client, guild, user } = member;

        const schema = await client.getServerConfigSchema();

        const { welcomeChannelId, welcomeMessages } = schema;

        const channel = (await client.channels
            .fetch(welcomeChannelId)
            .catch(() => null)) as GuildTextBasedChannel | null;

        if (!channel) return;

        let welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        if (!welcomeMessage) return;

        welcomeMessage = welcomeMessage
            .replaceAll('{user}', member.toString())
            .replaceAll('{username}', user.username)
            .replaceAll('{server}', guild.name)
            .replaceAll('{members}', guild.memberCount.toString());

        const channelEmbed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle(`Welkom ${user.username}!`)
            .setDescription(welcomeMessage)
            .setColor(client.config.color)
            .setTimestamp();

        const title = `Welkom ${user.username}!`;
        const description =
            'Welkom op de Het Streek Discord. Check de regels in <#985829312513052702>, start met kletsen in <#985824218476343306> en claim je rollen in <#985824313045291049>! Dit alles kan natuurlijk niet voor dat je geverifieërd bent, dat kan in <#984368582815273000>.';

        const dmEmbed = new EmbedBuilder().setTitle(title).setDescription(description).setTimestamp();

        await channel.send({ embeds: [channelEmbed] });

        await member.send({ embeds: [dmEmbed] }).catch(() => null);
    },
});
