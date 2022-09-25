import type { AutocompleteInteraction } from 'discord.js';
import { AutocompleteStructure } from './Structures';
import type { Structure } from './Types';

export interface Autocomplete extends Structure<AutocompleteInteraction<'cached'>> {}

@AutocompleteStructure
export class Autocomplete {
    name!: string;

    setName(name: string) {
        this.name = name;

        return this;
    }
}
