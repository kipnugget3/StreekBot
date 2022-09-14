import { Awaitable, Client, ClientEvents } from 'discord.js';

interface ClientEventData<K extends keyof ClientEvents> {
    name: K;
    run: (...args: ClientEvents[K]) => void;
}

export class ClientEvent<K extends keyof ClientEvents = keyof ClientEvents> {
    private _callback;
    name;

    constructor(data: ClientEventData<K>) {
        this.name = data.name;
        this._callback = data.run;
    }

    async run(...args: ClientEvents[K]) {
        try {
            await (this._callback(...args) as Awaitable<void>);
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
