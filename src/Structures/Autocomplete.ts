import type { AutocompleteInteraction } from 'discord.js';
import { type Structure, AutocompleteStructure } from '../Util';

export interface Autocomplete extends Structure<AutocompleteInteraction<'cached'>> {}

@AutocompleteStructure
export class Autocomplete {
    name!: string;

    setName(name: string) {
        this.name = name;

        return this;
    }
}
