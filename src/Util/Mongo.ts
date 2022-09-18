import type { Snowflake } from 'discord.js';

export interface VerifySchema {
    userId: string;
    naam: string;
    leerlingnummer: string;
}

export interface ServerConfigSchema {
    staffRoleId: Snowflake;
    verifiedRoleId: Snowflake;
    verificationSupportRoleId: Snowflake;

    logChannelId: Snowflake;
    verifyLogsChannelId: Snowflake;

    welcomeChannelId: Snowflake;
    leaveMessages: string[];
    welcomeMessages: string[];
}
