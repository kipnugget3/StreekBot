import { setInterval } from 'node:timers';
import { ActivityType, EmbedBuilder, Events, roleMention } from 'discord.js';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { io } from 'socket.io-client';
import { ClientEvent } from '../Structures';
import { getDailyDilemmasChannel, getDailyQuestionsChannel, getVerifyLogsChannel, getVerifyUser } from '../Util';

export default new ClientEvent()
    .setName(Events.ClientReady)
    .setOnce(true)
    .setCallback(async client => {
        const setClientActivity = () => client.user.setActivity('Het Streek', { type: ActivityType.Watching });

        setClientActivity();

        client.logger.info(`Client ready and logged in as ${client.user.tag}.`);

        setInterval(setClientActivity, 60 * 60 * 1000);

        const dailyRule = new RecurrenceRule();

        dailyRule.tz = 'Europe/Amsterdam';
        dailyRule.hour = 9;
        dailyRule.minute = dailyRule.second = 0;

        scheduleJob(dailyRule, async () => {
            const { _id, dailyDilemmas, dailyDilemmasRoleId } = await client.getServerConfigSchema();

            const dailyDilemmasChannel = await getDailyDilemmasChannel(client);

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

        scheduleJob(dailyRule, async () => {
            const { _id, dailyQuestions, dailyQuestionsRoleId } = await client.getServerConfigSchema();

            const dailyQuestionsChannel = await getDailyQuestionsChannel(client);

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

        const socket = io('http://localhost:3003');

        socket.on('connect', () => client.logger.info('Websocket connected.'));

        socket.on('verify', async (data: string) => {
            const { verifiedRoleId } = await client.getServerConfigSchema();

            const verifyUser = await getVerifyUser(client, { userId: data });

            if (!verifyUser) return;

            const guild = await client.guilds.fetch(client.config.guildId);
            const member = await guild.members.fetch(data);

            const verifyLogsChannel = await getVerifyLogsChannel(client);

            if (!member.roles.cache.has(verifiedRoleId)) {
                await member.roles.add(verifiedRoleId);

                await member.send('Email verificatie successvol!').catch(() => null);
            }

            const embed = new EmbedBuilder()
                .setDescription(`${member} is geverifieerd!`)
                .addFields({ name: 'Leerlingnummer', value: verifyUser.leerlingnummer })
                .setColor(client.config.color);

            await verifyLogsChannel.send({ embeds: [embed] });
        });

        socket.on('disconnect', () => client.logger.warn('Websocket disconnected.'));
    });
