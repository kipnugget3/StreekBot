import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Collection, Routes, type Client } from 'discord.js';
import type { Button } from './Button';
import type { ClientEvent } from './ClientEvent';
import type { ContextMenu, MessageContextMenu, UserContextMenu } from './ContextMenu';
import type { SelectMenu } from './SelectMenu';
import type { SlashCommand } from './SlashCommand';
import { StructureUtil } from './Structures';
import type {
    AnyAutocompleteStructure,
    AnyCommandStructure,
    AnyComponentStructure,
    AnyModalStructure,
    AnyStructure,
} from './Types';

interface BaseManagerData<T> {
    path: string;
    validator: (structure: T) => boolean;
    validatorErrorMsg: (key: string) => string;
}

abstract class BaseManager<T> {
    protected readonly path: string;
    protected readonly validator: (structure: T) => boolean;
    protected readonly validatorErrorMsg: (key: string) => string;

    constructor(public readonly client: Client, data: BaseManagerData<T>) {
        this.path = data.path;
        this.validator = data.validator;
        this.validatorErrorMsg = data.validatorErrorMsg;
    }

    abstract register(structure: T): void;

    registerAll() {
        if (!existsSync(this.path)) return;

        const files = readdirSync(this.path);

        for (const file of files) {
            const structure = require(join(this.path, file)).default;

            this.register(structure);
        }
    }
}

interface CachedManagerGetOptions<T extends AnyStructure> {
    key: string;
    required?: boolean;
    validator?: (structure: T) => boolean;
    validatorErrorMsg?: (key: string) => string;
}

abstract class CachedManager<T extends AnyStructure> extends BaseManager<T> {
    readonly cache = new Collection<string, T>();

    protected _get(options: CachedManagerGetOptions<T> & { required: true }): T;
    protected _get(options: CachedManagerGetOptions<T>): T | null;
    protected _get({
        key,
        required,
        validator = this.validator,
        validatorErrorMsg = this.validatorErrorMsg,
    }: CachedManagerGetOptions<T>) {
        const structure = this.cache.get(key);

        if (!structure) {
            if (required) throw new Error(`Structure "${key}" not found.`);

            return null;
        }

        if (!validator(structure)) throw new Error(validatorErrorMsg(key));

        return structure;
    }

    get(key: string, required: true): T;
    get(key: string, required?: boolean): T | null;
    get(key: string, required = false) {
        return this._get({ key, required });
    }

    protected _register(key: string, structure: T) {
        if (!this.validator(structure)) throw new Error(this.validatorErrorMsg(key));

        this.cache.set(key, structure);
    }
}

export class CommandManager extends CachedManager<AnyCommandStructure> {
    constructor(client: Client) {
        super(client, {
            path: join(__dirname, '..', 'Commands'),
            validator: StructureUtil.isCommand,
            validatorErrorMsg: key => `Structure "${key}" is not a command.`,
        });
    }

    register(structure: AnyCommandStructure): void {
        const key = structure.name;

        if (!key) throw new Error('Command has no name set.');

        this._register(key, structure);
    }

    async deployAll(): Promise<void> {
        const { cache: commands, client } = this;

        if (!client.isReady()) throw new Error('Cannot deploy commands until the client is ready.');

        const applicationId = client.application.id;

        const route = Routes.applicationCommands(applicationId);
        const body = commands.map(command => command.toJSON());

        await client.rest.put(route, { body });
    }

    getSlashCommand(key: string, required: true): SlashCommand;
    getSlashCommand(key: string, required?: boolean): SlashCommand | null;
    getSlashCommand(key: string, required = false) {
        return this._get({
            key,
            required,
            validator: StructureUtil.isSlashCommand,
            validatorErrorMsg: key => `Command "${key}" is not a slash command.`,
        });
    }

    getContextMenu(key: string, required: true): ContextMenu;
    getContextMenu(key: string, required?: boolean): ContextMenu | null;
    getContextMenu(key: string, required = false) {
        return this._get({
            key,
            required,
            validator: StructureUtil.isContextMenu,
            validatorErrorMsg: key => `Command "${key}" is not a context menu.`,
        });
    }

    getUserContextMenu(key: string, required: true): UserContextMenu;
    getUserContextMenu(key: string, required?: boolean): UserContextMenu | null;
    getUserContextMenu(key: string, required = false) {
        return this._get({
            key,
            required,
            validator: StructureUtil.isUserContextMenu,
            validatorErrorMsg: key => `Command "${key}" is not a user context menu.`,
        });
    }

    getMessageContextMenu(key: string, required: true): MessageContextMenu;
    getMessageContextMenu(key: string, required?: boolean): MessageContextMenu | null;
    getMessageContextMenu(key: string, required = false) {
        return this._get({
            key,
            required,
            validator: StructureUtil.isMessageContextMenu,
            validatorErrorMsg: key => `Command "${key}" is not a message context menu.`,
        });
    }
}

export class ComponentManager extends CachedManager<AnyComponentStructure> {
    constructor(client: Client) {
        super(client, {
            path: join(__dirname, '..', 'Components'),
            validator: StructureUtil.isComponent,
            validatorErrorMsg: key => `Structure "${key}" is not a component.`,
        });
    }

    register(structure: AnyComponentStructure): void {
        const key = structure.data.custom_id;

        if (!key) throw new Error('Component has no custom_id or url set.');

        return this._register(key, structure);
    }

    getButton(key: string, required: true): Button;
    getButton(key: string, required?: boolean): Button | null;
    getButton(key: string, required = false) {
        return this._get({
            key,
            required,
            validator: StructureUtil.isButton,
            validatorErrorMsg: key => `Component "${key}" is not an interaction button.`,
        });
    }

    getSelectMenu(key: string, required: true): SelectMenu;
    getSelectMenu(key: string, required?: boolean): SelectMenu | null;
    getSelectMenu(key: string, required = false) {
        return this._get({
            key,
            required,
            validator: StructureUtil.isSelectMenu,
            validatorErrorMsg: key => `Component "${key}" is not a select menu.`,
        });
    }
}

export class AutocompleteManager extends CachedManager<AnyAutocompleteStructure> {
    constructor(client: Client) {
        super(client, {
            path: join(__dirname, '..', 'Autocompletes'),
            validator: StructureUtil.isAutocomplete,
            validatorErrorMsg: key => `Structure "${key}" is not an autocomplete.`,
        });
    }

    register(structure: AnyAutocompleteStructure) {
        const key = structure.name;

        if (!key) throw new Error('Autocomplete has no name set.');

        this._register(key, structure);
    }
}

export class ModalManager extends CachedManager<AnyModalStructure> {
    constructor(client: Client) {
        super(client, {
            path: join(__dirname, '..', 'Modals'),
            validator: StructureUtil.isModal,
            validatorErrorMsg: key => `Structure "${key}" is not a modal.`,
        });
    }

    register(structure: AnyModalStructure) {
        const key = structure.data.custom_id;

        if (!key) throw new Error('Modal has no custom_id set.');

        this._register(key, structure);
    }
}

export class EventManager extends BaseManager<ClientEvent> {
    constructor(client: Client) {
        super(client, {
            path: join(__dirname, '..', 'Events'),
            validator: structure => typeof structure.name === 'string' && typeof structure.run === 'function',
            validatorErrorMsg: key => `Structure "${key}" is not an event.`,
        });
    }

    register(structure: ClientEvent) {
        const key = structure.name;

        if (!this.validator(structure)) throw new Error(this.validatorErrorMsg(key));

        structure.listen(this.client);
    }
}
