import { ApplicationCommandType, ComponentType, Interaction, isJSONEncodable } from 'discord.js';
import { callback as kCallback, structureType as kStructureType } from './Symbols';
import type {
    AnyAutocompleteStructure,
    AnyCommandStructure,
    AnyComponentStructure,
    AnyModalStructure,
    AnyStructure,
    Callback,
} from './Types';
import type { Button, ContextMenu, MessageContextMenu, SelectMenu, SlashCommand, UserContextMenu } from '../Structures';

export enum StructureType {
    Command = 'Command',
    Component = 'Component',
    Autocomplete = 'Autocomplete',
    Modal = 'Modal',
}

function BaseStructure(type: StructureType): ClassDecorator;
function BaseStructure(type: StructureType) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any) =>
        class extends target {
            [kStructureType] = type;
            [kCallback]!: Callback<Interaction>;

            async run(interaction: Interaction) {
                try {
                    await this[kCallback](interaction);
                } catch (err) {
                    if (!(err instanceof Error)) return;

                    interaction.client.logger.error(err);

                    if (!interaction.isRepliable()) return;

                    const content = 'Er is iets misgegaan!';

                    interaction.deferred || interaction.replied
                        ? interaction.ephemeral
                            ? interaction
                                  .editReply({ content, embeds: [], components: [] })
                                  .catch(() => interaction.followUp({ content, ephemeral: true }))
                                  .catch(() => null)
                            : interaction
                                  .deleteReply()
                                  .then(() => interaction.followUp({ content, ephemeral: true }))
                                  .catch(() => null)
                        : interaction.reply({ content, ephemeral: true }).catch(() => null);
                }
            }

            setCallback(cb: Callback<Interaction>) {
                this[kCallback] = cb;

                return this;
            }
        };
}

export const CommandStructure = BaseStructure(StructureType.Command);
export const ComponentStructure = BaseStructure(StructureType.Component);
export const AutocompleteStructure = BaseStructure(StructureType.Autocomplete);
export const ModalStructure = BaseStructure(StructureType.Modal);

export function getStructureType(structure: AnyStructure): StructureType {
    return structure[kStructureType];
}

export function getType(structure: AnyCommandStructure): ApplicationCommandType;
export function getType(structure: AnyComponentStructure): ComponentType;
export function getType(structure: AnyStructure): number {
    if (!isJSONEncodable(structure) || typeof structure.toJSON !== 'function') return -1;

    const json = structure.toJSON();

    return 'type' in json && typeof json.type === 'number' ? json.type : -1;
}

export function isCommand(structure: AnyStructure): structure is AnyCommandStructure {
    return getStructureType(structure) === StructureType.Command;
}

export function isSlashCommand(structure: AnyStructure): structure is SlashCommand {
    return isCommand(structure) && getType(structure) === ApplicationCommandType.ChatInput;
}

export function isContextMenu(structure: AnyStructure): structure is ContextMenu {
    return (
        isCommand(structure) &&
        [ApplicationCommandType.User, ApplicationCommandType.Message].includes(getType(structure))
    );
}

export function isUserContextMenu(structure: AnyStructure): structure is UserContextMenu {
    return isCommand(structure) && getType(structure) === ApplicationCommandType.User;
}

export function isMessageContextMenu(structure: AnyStructure): structure is MessageContextMenu {
    return isCommand(structure) && getType(structure) === ApplicationCommandType.Message;
}

export function isComponent(structure: AnyStructure): structure is AnyComponentStructure {
    return getStructureType(structure) === StructureType.Component;
}

export function isButton(structure: AnyStructure): structure is Button {
    return isComponent(structure) && getType(structure) === ComponentType.Button && 'custom_id' in structure.data;
}

export function isSelectMenu(structure: AnyStructure): structure is SelectMenu {
    return isComponent(structure) && getType(structure) === ComponentType.SelectMenu;
}

export function isAutocomplete(structure: AnyStructure): structure is AnyAutocompleteStructure {
    return getStructureType(structure) === StructureType.Autocomplete;
}

export function isModal(structure: AnyStructure): structure is AnyModalStructure {
    return getStructureType(structure) === StructureType.Modal;
}
