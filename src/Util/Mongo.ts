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

    logChannelId: Snowflake;
    verifyLogsChannelId: Snowflake;

    dailyQuestionsChannelId: Snowflake;
    dailyQuestions: string[];

    welcomeChannelId: Snowflake;
    leaveMessages: string[];
    welcomeMessages: string[];
}
