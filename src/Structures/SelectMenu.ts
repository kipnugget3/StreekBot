import { SelectMenuBuilder, type SelectMenuInteraction } from 'discord.js';
import { type Structure, ComponentStructure } from '../Util';

export interface SelectMenu extends Structure<SelectMenuInteraction<'cached'>> {}

@ComponentStructure
export class SelectMenu extends SelectMenuBuilder {}
