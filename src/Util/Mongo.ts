import type { Snowflake } from 'discord.js';

export interface VerifySchema {
    userId: string;
    naam: string;
    leerlingnummer: string;
}

export interface ServerConfigSchema {
    qotdRoleId: Snowflake;
    staffRoleId: Snowflake;
    verifiedRoleId: Snowflake;
    verificationSupportRoleId: Snowflake;

    dailyQuestionsChannelId: Snowflake;
    logChannelId: Snowflake;
    verifyLogsChannelId: Snowflake;
    welcomeChannelId: Snowflake;

    dailyQuestions: string[];
    leaveMessages: string[];
    welcomeMessages: string[];
}
