import process from 'node:process';
import { GatewayIntentBits } from 'discord.js';
import { Client } from './Structures';

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences];

const client = new Client({ intents });

process.setUncaughtExceptionCaptureCallback(err => {
    try {
        client.logger.error(err);
    } catch {
        // eslint-disable-next-line no-console
        console.error(err);
    }
});

client.build();
