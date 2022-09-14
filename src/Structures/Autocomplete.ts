import type { AutocompleteInteraction } from 'discord.js';
import { AutocompleteStructure } from './Structures';
import type { Structure } from './Types';

export interface Autocomplete extends Structure<AutocompleteInteraction<'cached'>> {}

@AutocompleteStructure
export class Autocomplete {
    declare name: string;

    setName(name: string): this {
        this.name = name;

        return this;
    }
}
