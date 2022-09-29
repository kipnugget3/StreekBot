import {
    ApplicationCommandType,
    type ChatInputCommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody,
    SlashCommandBuilder,
} from 'discord.js';
import { CommandStructure, type Structure } from '../Util';

declare module 'discord.js' {
    interface SlashCommandSubcommandsOnlyBuilder extends Structure<ChatInputCommandInteraction> {}
}

export interface SlashCommand extends Structure<ChatInputCommandInteraction> {}

@CommandStructure
export class SlashCommand extends SlashCommandBuilder {
    override toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        return Object.assign(super.toJSON(), { type: ApplicationCommandType.ChatInput });
    }
}
