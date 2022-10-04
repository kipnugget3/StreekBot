import process from 'node:process';
import { GatewayIntentBits } from 'discord.js';
import { Client } from './Structures';

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences];

const client = new Client({ intents });

process.setUncaughtExceptionCaptureCallback(err => client.logger.error(err));

client.build();
