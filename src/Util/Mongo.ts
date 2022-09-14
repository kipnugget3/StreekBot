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
    verifyErrorsChannelId: Snowflake;
    verifyLogsChannelId: Snowflake;
    verifySupportChannelId: Snowflake;

    welcomeChannelId: Snowflake;
    leaveMessages: string[];
    welcomeMessages: string[];
}
