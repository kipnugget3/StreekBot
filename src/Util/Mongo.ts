import type { Snowflake } from 'discord.js';

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
    logChannelId: Snowflake;
    verifyLogsChannelId: Snowflake;
    welcomeChannelId: Snowflake;

    dailyDilemmas: string[];
    dailyQuestions: string[];
    leaveMessages: string[];
    welcomeMessages: string[];
}
