import { Awaitable, Client, ClientEvents } from 'discord.js';
import { kCallback } from '../Util';

interface ClientEventData<K extends keyof ClientEvents> {
    name: K;
    run: (...args: ClientEvents[K]) => void;
}

export class ClientEvent<K extends keyof ClientEvents = keyof ClientEvents> {
    private [kCallback]: (...args: ClientEvents[K]) => void;
    name;

    constructor(data: ClientEventData<K>) {
        this.name = data.name;
        this[kCallback] = data.run;
    }

    async run(...args: ClientEvents[K]) {
        try {
            await (this[kCallback](...args) as Awaitable<void>);
        } catch (err) {
            if (!(err instanceof Error)) return;

            const firstArg = args[0];

            const client =
                firstArg instanceof Client
                    ? firstArg
                    : typeof firstArg === 'object' && firstArg && 'client' in firstArg
                    ? firstArg.client instanceof Client
                        ? firstArg.client
                        : null
                    : null;

            // eslint-disable-next-line no-console
            if (!client) return console.error(err);

            client.logger.error(err);
        }
    }
}
