import { SelectMenuBuilder, type SelectMenuInteraction } from 'discord.js';
import { ComponentStructure } from './Structures';
import type { Structure } from './Types';

export interface SelectMenu extends Structure<SelectMenuInteraction<'cached'>> {}

@ComponentStructure
export class SelectMenu extends SelectMenuBuilder {}
