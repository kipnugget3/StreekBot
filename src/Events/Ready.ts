import { setInterval } from 'node:timers';
import { ActivityType, EmbedBuilder, Events, GuildTextBasedChannel, roleMention } from 'discord.js';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { ClientEvent } from '../Structures';
import { throwDailyQuestionsChannelNotFoundError } from '../Errors';

export default new ClientEvent({
    name: Events.ClientReady,
    run: async client => {
        const setClientActivity = () => client.user.setActivity('Het Streek', { type: ActivityType.Watching });

        setClientActivity();

        client.logger.info(`Client ready and logged in as ${client.user.tag}.`);

        setInterval(setClientActivity, 60 * 60 * 1000);

        const rule = new RecurrenceRule();

        rule.tz = 'Europe/Amsterdam';
        rule.hour = 9;
        rule.minute = rule.second = 0;

        scheduleJob(rule, async () => {
            const { _id, dailyQuestions, dailyQuestionsChannelId, qotdRoleId } = await client.getServerConfigSchema();

            const dailyQuestionsChannel = client.channels.cache.ensure(
                dailyQuestionsChannelId,
                throwDailyQuestionsChannelNotFoundError
            ) as GuildTextBasedChannel;

            const index = Math.floor(Math.random() * dailyQuestions.length);

            const question = dailyQuestions[index];

            if (!question) return client.logger.warn('No daily question found.');

            const embed = new EmbedBuilder().setColor(client.config.color).setDescription(question).setTimestamp();

            const message = await dailyQuestionsChannel.send({ content: roleMention(qotdRoleId), embeds: [embed] });

            await message.pin();

            dailyQuestions.splice(index, 1);

            await client.serverConfigCollection.updateOne({ _id }, { $set: { dailyQuestions } });
        });
    },
});
