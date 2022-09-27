import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    type ContextMenuCommandInteraction,
    type ContextMenuCommandType,
    type MessageContextMenuCommandInteraction,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { type Structure, CommandStructure } from '../Util';

interface BaseContextMenu<T extends ContextMenuCommandInteraction<'cached'>> extends Structure<T> {}

@CommandStructure
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class BaseContextMenu<T extends ContextMenuCommandInteraction<'cached'>> extends ContextMenuCommandBuilder {
    override setType(type: ContextMenuCommandType): never;
    override setType() {
        throw new Error(`The type of a ${this.constructor.name} cannot be changed.`);
    }
}

export class UserContextMenu extends BaseContextMenu<UserContextMenuCommandInteraction<'cached'>> {
    override readonly type = ApplicationCommandType.User;
}

export class MessageContextMenu extends BaseContextMenu<MessageContextMenuCommandInteraction<'cached'>> {
    override readonly type = ApplicationCommandType.Message;
}

export type ContextMenu = UserContextMenu | MessageContextMenu;
