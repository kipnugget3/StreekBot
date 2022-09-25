import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
    type ModalActionRowComponentBuilder,
    type RestOrArray,
} from 'discord.js';

export class MessageActionRow extends ActionRowBuilder<MessageActionRowComponentBuilder> {}

export class ModalActionRow extends ActionRowBuilder<ModalActionRowComponentBuilder> {
    constructor(component?: ModalActionRowComponentBuilder) {
        super(component ? { components: [component] } : {});
    }

    override addComponents(...components: RestOrArray<ModalActionRowComponentBuilder>): never;
    override addComponents() {
        throw new Error('addComponents() is not supported on ModalActionRow. Use setComponent() instead.');
    }

    override setComponents(...components: RestOrArray<ModalActionRowComponentBuilder>): never;
    override setComponents() {
        throw new Error('setComponents() is not supported on ModalActionRow. Use setComponent() instead.');
    }

    setComponent(component: ModalActionRowComponentBuilder) {
        return super.setComponents(component);
    }

    get component(): ModalActionRowComponentBuilder {
        if (this.components.length === 0) throw new Error('No component has been set on this ModalActionRow.');

        return this.components[0];
    }
}

export type ActionRow = MessageActionRow | ModalActionRow;
