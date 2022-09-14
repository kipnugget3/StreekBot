import { ActivityType, Events } from 'discord.js';
import { ClientEvent } from '../Structures';

export default new ClientEvent({
    name: Events.ClientReady,
    run: async client => {
        client.user.setActivity('Het Streek', { type: ActivityType.Watching });

        client.logger.info(`Client ready and logged in as ${client.user.tag}.`);

        await client.commands.deployAll();

        client.logger.info('Application commands deployed successfully.');
    },
});
