import { setTimeout } from 'node:timers';
import { ButtonStyle, EmbedBuilder, GuildTextBasedChannel, roleMention, Snowflake } from 'discord.js';
import { Button } from '../Structures';
import { throwVerifyLogsChannelNotFoundError } from '../Errors';

const cooldowns = new Map<Snowflake, number>();

export default new Button()
    .setCustomId('help')
    .setLabel('Hulp Nodig?')
    .setStyle(ButtonStyle.Danger)
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const { client, guild, user } = interaction;

        const now = Date.now();
        const cooldownAmount = 60 * 60 * 1000;

        if (cooldowns.has(user.id)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const expiresTimestamp = cooldowns.get(user.id)! + cooldownAmount;

            if (now > expiresTimestamp) return cooldowns.delete(user.id);

            const timeLeftInSeconds = (expiresTimestamp - now) / 1000;

            return interaction.editReply(
                `Please wait ${timeLeftInSeconds.toFixed(1)} more seconds before using that button!`
            );
        }

        cooldowns.set(user.id, now);

        setTimeout(() => cooldowns.delete(user.id), cooldownAmount);

        const { verificationSupportRoleId, verifyLogsChannelId } = await client.getServerConfigSchema();

        const verifyLogsChannel = guild.channels.cache.ensure(
            verifyLogsChannelId,
            throwVerifyLogsChannelNotFoundError
        ) as GuildTextBasedChannel;

        const embed = new EmbedBuilder()
            .setDescription(`${user} heeft hulp nodig met verifiëren!`)
            .setColor(client.config.color);

        await verifyLogsChannel.send({ content: roleMention(verificationSupportRoleId), embeds: [embed] });

        await interaction.editReply('Staff is geinformeerd dat je hulp nodig hebt.');
    });
