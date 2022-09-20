import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from 'discord.js';

export * from './Mongo';

export const kStructureType = Symbol('structureType');

export const kCallback = Symbol('callback');

export function cloneObject<T extends object>(obj: T): T {
    return Object.assign(Object.create(obj), obj);
}

type NumberFromZeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type NumberWithPadding<N extends number> = N extends NumberFromZeroToNine ? `0${N}` : `${N}`;

export function forcePadding<N extends number>(num: N): NumberWithPadding<N> {
    return `${num < 10 ? '0' : ''}${num}` as NumberWithPadding<N>;
}

export function formatDate(format: string, timestamp = Date.now()) {
    const date = new Date(timestamp);

    const years = date.getFullYear().toString();
    const months = forcePadding(date.getMonth() + 1);
    const days = forcePadding(date.getDate());

    const hours = forcePadding(date.getHours());
    const minutes = forcePadding(date.getMinutes());
    const seconds = forcePadding(date.getSeconds());

    return format
        .replaceAll('YYYY', years)
        .replaceAll('MM', months)
        .replaceAll('DD', days)
        .replaceAll('hh', hours)
        .replaceAll('mm', minutes)
        .replaceAll('ss', seconds);
}

export async function embedPages(
    interaction: Interaction<'cached'>,
    embed: EmbedBuilder,
    fields: APIEmbedField[],
    perPage = 10
) {
    if (!interaction.isRepliable()) throw new Error('Interaction is not repliable.');

    if (!interaction.deferred) await interaction.deferReply();

    const pages = Array.from({ length: Math.ceil(fields.length / perPage) }, (_, idx) => {
        const start = idx * perPage;
        const end = start + perPage;

        return fields.slice(start, end);
    });

    let page = 0;

    embed.setFields(pages[page]).setFooter({ text: `Page ${page + 1} of ${pages.length}` });

    if (pages.length === 1) return interaction.editReply({ embeds: [embed] });

    const first = new ButtonBuilder().setCustomId('first').setEmoji('⏪').setStyle(ButtonStyle.Primary);
    const previous = new ButtonBuilder().setCustomId('previous').setEmoji('◀️').setStyle(ButtonStyle.Primary);
    const next = new ButtonBuilder().setCustomId('next').setEmoji('▶️').setStyle(ButtonStyle.Primary);
    const last = new ButtonBuilder().setCustomId('last').setEmoji('⏩').setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(first, previous, next, last);

    const message = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = message.createMessageComponentCollector({ time: 60_000 });

    collector.on('collect', receivedInteraction => {
        if (receivedInteraction.user.id !== interaction.user.id) return;

        switch (receivedInteraction.customId) {
            case 'first':
                page = 0;
                break;
            case 'previous':
                page = Math.max(page - 1, 0);
                break;
            case 'next':
                page = Math.min(page + 1, pages.length - 1);
                break;
            case 'last':
                page = pages.length - 1;
                break;
            default:
                break;
        }

        embed.setFields(pages[page]).setFooter({ text: `Page ${page + 1} of ${pages.length}` });

        receivedInteraction.update({ embeds: [embed] });
    });

    collector.on('end', () => {
        row.setComponents(row.components.map(component => component.setDisabled(true)));

        message.edit({ components: [row] });
    });
}
