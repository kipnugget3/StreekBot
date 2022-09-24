import { setInterval } from 'node:timers';
import { ActivityType, EmbedBuilder, Events, GuildTextBasedChannel, roleMention } from 'discord.js';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { ClientEvent } from '../Structures';
import { throwDailyQuestionsChannelNotFoundError, throwDailyDilemmasChannelNotFoundError } from '../Errors';

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
            const {
                _id,
                dailyDilemmas,
                dailyQuestions,
                dailyDilemmaChannelId,
                dailyQuestionsChannelId,
                dailyDilemmaRoleId,
                qotdRoleId,
            } = await client.getServerConfigSchema();

            const dailyDilemmasChannel = client.channels.cache.ensure(
                dailyDilemmaChannelId,
                throwDailyDilemmasChannelNotFoundError
            ) as GuildTextBasedChannel;

            const dailyQuestionsChannel = client.channels.cache.ensure(
                dailyQuestionsChannelId,
                throwDailyQuestionsChannelNotFoundError
            ) as GuildTextBasedChannel;

            const dailyDilemmaIndex = Math.floor(Math.random() * dailyDilemmas.length);
            const dilemma = dailyDilemmas[dailyDilemmaIndex];

            const dailyQuestionIndex = Math.floor(Math.random() * dailyQuestions.length);
            const question = dailyQuestions[dailyQuestionIndex];

            if (!dilemma) return client.logger.warn('No daily dilemma found.');
            if (!question) return client.logger.warn('No daily question found.');

            const dilemmaEmbed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(dilemma)
                .setTimestamp();

            const message = await dailyDilemmasChannel.send({ content: roleMention(dailyDilemmaRoleId), embeds: [dilemmaEmbed] })
            
            await message.pin();

            const questionEmbed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(question)
                .setTimestamp();

            const message = await dailyQuestionsChannel.send({ content: roleMention(qotdRoleId), embeds: [questionEmbed] })
                
            await message.pin();

            dailyQuestions.splice(dailyQuestionIndex, 1);

            await client.serverConfigCollection.updateOne({ _id }, { $set: { dailyQuestions } });
        });
    },
});
