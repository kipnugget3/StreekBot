import { ApplicationCommandType, Awaitable, ComponentType, Interaction, isJSONEncodable } from 'discord.js';
import type { Button } from './Button';
import type { ContextMenu, MessageContextMenu, UserContextMenu } from './ContextMenu';
import type { SelectMenu } from './SelectMenu';
import type { SlashCommand } from './SlashCommand';
import type {
    AnyAutocompleteStructure,
    AnyCommandStructure,
    AnyComponentStructure,
    AnyModalStructure,
    AnyStructure,
    Callback,
} from './Types';
import { kCallback, kStructureType } from '../Util';

export enum StructureType {
    Command = 'Command',
    Component = 'Component',
    Autocomplete = 'Autocomplete',
    Modal = 'Modal',
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function BaseStructure(type: StructureType): ClassDecorator;
function BaseStructure(type: StructureType) {
    return (target: any) =>
        class extends target {
            [kStructureType] = type;
            [kCallback]!: Callback<any>;

            async run(interaction: Interaction<'cached'>) {
                try {
                    await (this[kCallback](interaction) as Awaitable<any>);
                } catch (err) {
                    if (!(err instanceof Error)) return;

                    interaction.client.logger.error(err);

                    if (!interaction.isRepliable()) return;

                    const content = 'Er is iets misgegaan!';

                    await (interaction.deferred || interaction.replied
                        ? interaction.ephemeral
                            ? interaction
                                  .editReply({ content, embeds: [], components: [] })
                                  .catch(() => interaction.followUp({ content, ephemeral: true }))
                                  .catch(() => null)
                            : interaction
                                  .deleteReply()
                                  .catch(() => null)
                                  .then(() => interaction.followUp({ content, ephemeral: true }))
                                  .catch(() => null)
                        : interaction.reply({ content, ephemeral: true }).catch(() => null));
                }
            }

            setCallback(cb: Callback<any>) {
                this[kCallback] = cb;

                return this;
            }
        };
}

export const CommandStructure = BaseStructure(StructureType.Command);
export const ComponentStructure = BaseStructure(StructureType.Component);
export const AutocompleteStructure = BaseStructure(StructureType.Autocomplete);
export const ModalStructure = BaseStructure(StructureType.Modal);

function getStructureType(structure: AnyStructure): StructureType {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (structure as any)[kStructureType];
}

function getType(structure: AnyCommandStructure): ApplicationCommandType;
function getType(structure: AnyComponentStructure): ComponentType;
function getType(structure: AnyStructure): number {
    if (!isJSONEncodable(structure) || typeof structure.toJSON !== 'function') return -1;

    const json = structure.toJSON();

    return 'type' in json && typeof json.type === 'number' ? json.type : -1;
}

export class StructureUtil extends null {
    static getStructureType = getStructureType;
    static getType = getType;

    static isCommand(structure: AnyStructure): structure is AnyCommandStructure {
        return getStructureType(structure) === StructureType.Command;
    }

    static isSlashCommand(structure: AnyStructure): structure is SlashCommand {
        return StructureUtil.isCommand(structure) && getType(structure) === ApplicationCommandType.ChatInput;
    }

    static isContextMenu(structure: AnyStructure): structure is ContextMenu {
        return (
            StructureUtil.isCommand(structure) &&
            [ApplicationCommandType.User, ApplicationCommandType.Message].includes(getType(structure))
        );
    }

    static isUserContextMenu(structure: AnyStructure): structure is UserContextMenu {
        return StructureUtil.isCommand(structure) && getType(structure) === ApplicationCommandType.User;
    }

    static isMessageContextMenu(structure: AnyStructure): structure is MessageContextMenu {
        return StructureUtil.isCommand(structure) && getType(structure) === ApplicationCommandType.Message;
    }

    static isComponent(structure: AnyStructure): structure is AnyComponentStructure {
        return getStructureType(structure) === StructureType.Component;
    }

    static isButton(structure: AnyStructure): structure is Button {
        return (
            StructureUtil.isComponent(structure) &&
            getType(structure) === ComponentType.Button &&
            'custom_id' in structure.data
        );
    }

    static isSelectMenu(structure: AnyStructure): structure is SelectMenu {
        return StructureUtil.isComponent(structure) && getType(structure) === ComponentType.SelectMenu;
    }

    static isAutocomplete(structure: AnyStructure): structure is AnyAutocompleteStructure {
        return getStructureType(structure) === StructureType.Autocomplete;
    }

    static isModal(structure: AnyStructure): structure is AnyModalStructure {
        return getStructureType(structure) === StructureType.Modal;
    }
}
