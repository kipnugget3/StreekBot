import { env } from 'node:process';
import { Client as BaseClient, type ClientApplication, type ClientOptions, type ClientUser } from 'discord.js';
import { type Collection, type Db, MongoClient, WithId } from 'mongodb';
import { AutocompleteManager, CommandManager, ComponentManager, EventManager, ModalManager } from './Managers';
import { Logger } from './Logger';
import type { ServerConfigSchema, VerifySchema } from '../Util';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            MONGO_URI: string;
            WEBHOOK_URL: string;
        }
    }
}

interface ClientConfig {
    token: string;
    mongoUri: string;
    webhookURL: string;
    color: number;
}

declare module 'discord.js' {
    interface Client {
        commands: CommandManager;
        components: ComponentManager;
        autocompletes: AutocompleteManager;
        modals: ModalManager;
        events: EventManager;

        config: ClientConfig;
        logger: Logger;

        mongoClient: MongoClient;
        database: Db;

        getServerConfigSchema(): Promise<WithId<ServerConfigSchema>>;

        get verificationCollection(): Collection<VerifySchema>;
        get serverConfigCollection(): Collection<ServerConfigSchema>;
    }
}

export class Client extends BaseClient {
    declare application: ClientApplication;
    declare user: ClientUser;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new CommandManager(this);
        this.components = new ComponentManager(this);
        this.autocompletes = new AutocompleteManager(this);
        this.modals = new ModalManager(this);
        this.events = new EventManager(this);

        this.config = {
            token: env.DISCORD_TOKEN,
            mongoUri: env.MONGO_URI,
            webhookURL: env.WEBHOOK_URL,
            color: 0x5d2f88,
        };

        this.logger = new Logger(this);

        this.mongoClient = new MongoClient(this.config.mongoUri);
        this.database = this.mongoClient.db('Streekbot');
    }

    build() {
        this.commands.registerAll();
        this.components.registerAll();
        this.autocompletes.registerAll();
        this.modals.registerAll();
        this.events.registerAll();

        this.login(this.config.token);
    }

    override async getServerConfigSchema() {
        const schema = await this.serverConfigCollection.findOne();

        if (!schema) throw new Error('No server config schema found.');

        return schema;
    }

    override get verificationCollection(): Collection<VerifySchema> {
        return this.database.collection('verificaties');
    }

    override get serverConfigCollection(): Collection<ServerConfigSchema> {
        return this.database.collection('serverconfig');
    }
}
