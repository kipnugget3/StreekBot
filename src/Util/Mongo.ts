import type { Client, GuildTextBasedChannel, Snowflake } from 'discord.js';
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

export async function getDailyDilemmasChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { dailyDilemmasChannelId } = await client.getServerConfigSchema();

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(
        dailyDilemmasChannelId,
        throwDailyDilemmasChannelNotFoundError
    ) as GuildTextBasedChannel;
}

export async function getDailyQuestionsChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { dailyQuestionsChannelId } = await client.getServerConfigSchema();

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(
        dailyQuestionsChannelId,
        throwDailyQuestionsChannelNotFoundError
    ) as GuildTextBasedChannel;
}

export async function getVerifyLogsChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { verifyLogsChannelId } = await client.getServerConfigSchema();

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(
        verifyLogsChannelId,
        throwVerifyLogsChannelNotFoundError
    ) as GuildTextBasedChannel;
}

export async function getWelcomeChannel(client: Client<true>): Promise<GuildTextBasedChannel> {
    const { welcomeChannelId } = await client.getServerConfigSchema();

    const guild = await client.guilds.fetch(client.config.guildId);

    return guild.channels.cache.ensure(welcomeChannelId, throwWelcomeChannelNotFoundError) as GuildTextBasedChannel;
}
