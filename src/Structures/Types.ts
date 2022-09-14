import type { BaseInteraction } from 'discord.js';
import type { SlashCommand, ContextMenu, SelectMenu, Autocomplete, Modal, Button } from '.';

export type Callback<T extends BaseInteraction<'cached'>> = (interaction: T) => void;

export interface Structure<T extends BaseInteraction<'cached'>> {
    run: Callback<T>;
    setCallback(cb: Callback<T>): this;
}

export type AnyCommandStructure = SlashCommand | ContextMenu;

export type AnyComponentStructure = Button | SelectMenu;

export type AnyAutocompleteStructure = Autocomplete;

export type AnyModalStructure = Modal;

export type AnyStructure = AnyCommandStructure | AnyComponentStructure | AnyAutocompleteStructure | AnyModalStructure;
