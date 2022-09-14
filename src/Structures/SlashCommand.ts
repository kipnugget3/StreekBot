import {
    ApplicationCommandType,
    type ChatInputCommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody,
    SlashCommandBuilder,
} from 'discord.js';
import { CommandStructure } from './Structures';
import type { Structure } from './Types';

declare module 'discord.js' {
    interface SlashCommandSubcommandsOnlyBuilder extends Structure<ChatInputCommandInteraction<'cached'>> {}
}

export interface SlashCommand extends Structure<ChatInputCommandInteraction<'cached'>> {}

@CommandStructure
export class SlashCommand extends SlashCommandBuilder {
    override toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        return Object.assign(super.toJSON(), { type: ApplicationCommandType.ChatInput });
    }
}
