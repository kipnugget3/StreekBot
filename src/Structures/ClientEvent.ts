import type { Client, ClientEvents } from 'discord.js';

export class ClientEvent<K extends keyof ClientEvents = keyof ClientEvents> {
    name!: K;
    once!: boolean;
    run!: (...args: ClientEvents[K]) => void;

    setName<U extends keyof ClientEvents>(name: U): ClientEvent<U>;
    setName(name: K) {
        this.name = name;

        return this;
    }

    setOnce(once: boolean) {
        this.once = once;

        return this;
    }

    setCallback(cb: (...args: ClientEvents[K]) => void) {
        this.run = cb;

        return this;
    }

    listen(client: Client) {
        client[this.once ? 'once' : 'on'](this.name, this.run);
    }
}
