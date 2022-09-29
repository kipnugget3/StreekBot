import { setInterval } from 'node:timers';
import { ActivityType, EmbedBuilder, Events, roleMention } from 'discord.js';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { io } from 'socket.io-client';
import { ClientEvent, MessageActionRow } from '../Structures';
import { getDailyDilemmasChannel, getDailyQuestionsChannel, getVerifyLogsChannel } from '../Util';

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

        scheduleJob(rule, async () => {
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

        scheduleJob(rule, async () => {
            const verifyUserIds = (await client.verificationCollection.find().toArray()).map(u => u.userId);

            const guild = await client.guilds.fetch(client.config.guildId);

            const notVerified = guild.members.cache.filter(m => !verifyUserIds.includes(m.id));

            const verifyButton = client.components.getButton('verify', true);
            const helpButton = client.components.getButton('help', true);
            const row = new MessageActionRow().setComponents(verifyButton, helpButton);

            let usersSent = 0;

            for (const member of notVerified.values()) {
                await member
                    .send({
                        content: 'Je bent nog niet geverifieerd, doe dit zo snel mogelijk met de knop hieronder!',
                        components: [row],
                    })
                    .then(() => usersSent++)
                    .catch(() => null);
            }

            client.logger.info(`Sent reminders to ${usersSent} of ${notVerified.size} unverified users.`);
        });

        const socket = io('http://localhost:3003');

        socket.on('connect', () => client.logger.info('Websocket connected.'));

        socket.on('verify', async (data: string) => {
            const { verifiedRoleId } = await client.getServerConfigSchema();
            const verifyUser = await client.verificationCollection.findOne({ userId: data });

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
