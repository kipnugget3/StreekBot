import { setInterval } from 'node:timers';
import { ActivityType, Events } from 'discord.js';
import { ClientEvent } from '../Structures';

export default new ClientEvent({
    name: Events.ClientReady,
    run: async client => {
        const setClientActivity = () => client.user.setActivity('Het Streek', { type: ActivityType.Watching });

        setClientActivity();

        client.logger.info(`Client ready and logged in as ${client.user.tag}.`);

        setInterval(setClientActivity, 60 * 60 * 1000);
    },
});
