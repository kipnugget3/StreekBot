import type { Snowflake } from 'discord.js';

export interface VerifySchema {
    userId: string;
    naam: string;
    leerlingnummer: string;
}

export interface ServerConfigSchema {
    dailyDilemmaRoleId: Snowflake;
    qotdRoleId: Snowflake;
    staffRoleId: Snowflake;
    verifiedRoleId: Snowflake;
    verificationSupportRoleId: Snowflake;

    dailyDilemmaChannelId: Snowflake;
    dailyQuestionsChannelId: Snowflake;
    logChannelId: Snowflake;
    verifyLogsChannelId: Snowflake;
    welcomeChannelId: Snowflake;

    dailyDilemmas: string[];
    dailyQuestions: string[];
    leaveMessages: string[];
    welcomeMessages: string[];
}
