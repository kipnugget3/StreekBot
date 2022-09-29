import { SelectMenuBuilder, type SelectMenuInteraction } from 'discord.js';
import { type Structure, ComponentStructure } from '../Util';

export interface SelectMenu extends Structure<SelectMenuInteraction> {}

@ComponentStructure
export class SelectMenu extends SelectMenuBuilder {}
