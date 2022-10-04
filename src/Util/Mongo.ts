import type { Client, GuildTextBasedChannel, Snowflake } from 'discord.js';
import type { WithId } from 'mongodb';
import {
    throwDailyDilemmasChannelNotFoundError,
    throwDailyQuestionsChannelNotFoundError,
    throwVerifyLogsChannelNotFoundError,
    throwWelcomeChannelNotFoundError,
} from './Errors';

export interface VerifySchema {
    userId: string;
    leerlingnummer: string;
}

export function getVerifyUsers(client: Client<true>): Promise<WithId<VerifySchema>[]> {
    return client.verificationCollection.find().toArray();
}

interface GetVerifyUserOptions extends Partial<WithId<VerifySchema>> {}

export function getVerifyUser(
    client: Client<true>,
    options: GetVerifyUserOptions
): Promise<WithId<VerifySchema> | null> {
    return client.verificationCollection.findOne(options);
}

export interface ServerConfigSchema {
    dailyDilemmasRoleId: Snowflake;
    dailyQuestionsRoleId: Snowflake;
    staffRoleId: Snowflake;
    verifiedRoleId: Snowflake;
    verificationSupportRoleId: Snowflake;

    dailyDilemmasChannelId: Snowflake;
    dailyQuestionsChannelId: Snowflake;
    verifyLogsChannelId: Snowflake;
    welcomeChannelId: Snowflake;

    dailyDilemmas: string[];
    dailyQuestions: string[];
    leaveMessages: string[];
    welcomeMessages: string[];
}

export async function getServerConfig(client: Client<true>): Promise<WithId<ServerConfigSchema>> {
    const schema = await client.serverConfigCollection.findOne();

    if (!schema) throw new Error('No server config schema found.');

    return schema;
}

export async function getDailyDilemmasChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { dailyDilemmasChannelId } = await getServerConfig(client);

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(
        dailyDilemmasChannelId,
        throwDailyDilemmasChannelNotFoundError
    ) as GuildTextBasedChannel;
}

export async function getDailyQuestionsChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { dailyQuestionsChannelId } = await getServerConfig(client);

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(
        dailyQuestionsChannelId,
        throwDailyQuestionsChannelNotFoundError
    ) as GuildTextBasedChannel;
}

export async function getVerifyLogsChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { verifyLogsChannelId } = await getServerConfig(client);

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(
        verifyLogsChannelId,
        throwVerifyLogsChannelNotFoundError
    ) as GuildTextBasedChannel;
}

export async function getWelcomeChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { welcomeChannelId } = await getServerConfig(client);

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(welcomeChannelId, throwWelcomeChannelNotFoundError) as GuildTextBasedChannel;
}
