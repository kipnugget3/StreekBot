import { setInterval } from 'node:timers';
import { ActivityType, EmbedBuilder, Events, GuildTextBasedChannel, roleMention } from 'discord.js';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { ClientEvent } from '../Structures';
import { throwDailyQuestionsChannelNotFoundError, throwDailyDilemmasChannelNotFoundError } from '../Errors';

export default new ClientEvent()
    .setName(Events.ClientReady)
    .setOnce(true)
    .setCallback(async client => {
        const setClientActivity = () => client.user.setActivity('Het Streek', { type: ActivityType.Watching });

        setClientActivity();

        client.logger.info(`Client ready and logged in as ${client.user.tag}.`);

        setInterval(setClientActivity, 60 * 60 * 1000);

        const rule = new RecurrenceRule();

        rule.tz = 'Europe/Amsterdam';
        rule.hour = 9;
        rule.minute = rule.second = 0;

        scheduleJob(rule, async () => {
            const { _id, dailyDilemmas, dailyDilemmasChannelId, dailyDilemmasRoleId } =
                await client.getServerConfigSchema();

            const dailyDilemmasChannel = client.channels.cache.ensure(
                dailyDilemmasChannelId,
                throwDailyDilemmasChannelNotFoundError
            ) as GuildTextBasedChannel;

            const index = Math.floor(Math.random() * dailyDilemmas.length);
            const dilemma = dailyDilemmas[index];

            if (!dilemma) return client.logger.warn('No daily dilemma found.');

            const embed = new EmbedBuilder().setColor(client.config.color).setDescription(dilemma).setTimestamp();

            const message = await dailyDilemmasChannel.send({
                content: roleMention(dailyDilemmasRoleId),
                embeds: [embed],
            });

            await message.pin();

            dailyDilemmas.splice(index, 1);

            await client.serverConfigCollection.updateOne({ _id }, { $set: { dailyDilemmas } });
        });

        scheduleJob(rule, async () => {
            const { _id, dailyQuestions, dailyQuestionsChannelId, dailyQuestionsRoleId } =
                await client.getServerConfigSchema();

            const dailyQuestionsChannel = client.channels.cache.ensure(
                dailyQuestionsChannelId,
                throwDailyQuestionsChannelNotFoundError
            ) as GuildTextBasedChannel;

            const index = Math.floor(Math.random() * dailyQuestions.length);
            const question = dailyQuestions[index];

            if (!question) return client.logger.warn('No daily question found.');

            const embed = new EmbedBuilder().setColor(client.config.color).setDescription(question).setTimestamp();

            const message = await dailyQuestionsChannel.send({
                content: roleMention(dailyQuestionsRoleId),
                embeds: [embed],
            });

            await message.pin();

            dailyQuestions.splice(index, 1);

            await client.serverConfigCollection.updateOne({ _id }, { $set: { dailyQuestions } });
        });
    });
