import {
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithURL,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    LinkButtonComponentData,
    InteractionButtonComponentData,
    ButtonComponentData,
    APIButtonComponent,
} from 'discord.js';
import { type Structure, ComponentStructure } from '../Util';

export interface Button extends Structure<ButtonInteraction> {}

@ComponentStructure
export class Button extends ButtonBuilder {
    declare readonly data: APIButtonComponentWithCustomId;

    constructor(data?: Partial<InteractionButtonComponentData> | Partial<APIButtonComponentWithCustomId>);
    constructor(data: Partial<ButtonComponentData> | Partial<APIButtonComponent> = {}) {
        if (data.style === ButtonStyle.Link)
            throw new Error('Cannot create a Button with Link style. Use LinkButton instead.');
        else if ('url' in data) throw new Error('Cannot create a Button with a url. Use LinkButton instead.');

        super(data);
    }

    override setStyle(style: Exclude<ButtonStyle, ButtonStyle.Link>): this;
    override setStyle(style: ButtonStyle) {
        if (style === ButtonStyle.Link)
            throw new Error('The style of a Button cannot be Link. Use LinkButton instead.');

        return super.setStyle(style);
    }

    override setURL(url: string): never;
    override setURL() {
        throw new Error('The url of a Button cannot be set. Use LinkButton instead.');
    }
}

export class LinkButton extends ButtonBuilder {
    declare readonly data: APIButtonComponentWithURL;

    constructor(data?: Partial<LinkButtonComponentData> | Partial<APIButtonComponentWithURL>);
    constructor(data: Partial<ButtonComponentData> | Partial<APIButtonComponent> = {}) {
        if ((data.style ??= ButtonStyle.Link) !== ButtonStyle.Link)
            throw new Error('Cannot create a LinkButton with a non-Link style. Use Button instead.');
        else if ('customId' in data || 'custom_id' in data)
            throw new Error('Cannot create a LinkButton with a custom_id. Use Button instead.');

        super(data);
    }

    override setStyle(style: ButtonStyle): never;
    override setStyle() {
        throw new Error('The style of a LinkButton cannot be changed. Use Button instead.');
    }

    override setCustomId(customId: string): never;
    override setCustomId() {
        throw new Error('The customId of a LinkButton cannot be set. Use Button instead.');
    }
}
