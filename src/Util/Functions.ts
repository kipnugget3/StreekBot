import { APIEmbedField, ButtonStyle, ComponentType, EmbedBuilder, GuildMember, Interaction } from 'discord.js';
import { Button, MessageActionRow } from '../Structures';

interface CompareStringsOptions {
    ignoreCase?: boolean;
}

export function compareStrings(strings: string[], options?: CompareStringsOptions): boolean;
export function compareStrings(strings: string[], { ignoreCase = false }: CompareStringsOptions = {}): boolean {
    const [first, ...rest] = strings;

    return rest.every(str => (ignoreCase ? str.toLowerCase() === first.toLowerCase() : str === first));
}

interface FormatMessageData {
    member: GuildMember;
}

export function formatMessage(message: string, data: FormatMessageData): string;
export function formatMessage(message: string, { member }: FormatMessageData) {
    return message
        .replaceAll('{user}', member.user.toString())
        .replaceAll('{username}', member.user.username)
        .replaceAll('{server}', member.guild.name)
        .replaceAll('{members}', member.guild.memberCount.toString());
}

export function forcePadding(num: number) {
    return `${num < 10 ? '0' : ''}${num}`;
}

export function formatDate(format: string, date?: Date): string;
export function formatDate(format: string, timestamp?: number): string;
export function formatDate(format: string, dateOrTimestamp: Date | number = Date.now()) {
    const date = new Date(dateOrTimestamp);

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

interface EmbedPagesOptions {
    perPage?: number;
}

export async function embedPages(
    interaction: Interaction,
    embed: EmbedBuilder,
    fields: APIEmbedField[],
    options?: EmbedPagesOptions
): Promise<void>;
export async function embedPages(
    interaction: Interaction,
    embed: EmbedBuilder,
    fields: APIEmbedField[],
    { perPage = 5 }: EmbedPagesOptions = {}
) {
    if (!interaction.isRepliable()) throw new Error('Interaction is not repliable.');

    if (!interaction.deferred) await interaction.deferReply();

    const pages = Array.from({ length: Math.ceil(fields.length / perPage) }, (_, idx) =>
        fields.slice(idx * perPage, (idx + 1) * perPage)
    );

    let page = 0;

    embed.setFields(pages[page]).setFooter({ text: `Page ${page + 1} of ${pages.length}` });

    if (pages.length === 1) return void (await interaction.editReply({ embeds: [embed] }));

    const first = new Button().setCustomId('first').setEmoji('⏪').setStyle(ButtonStyle.Primary);
    const previous = new Button().setCustomId('previous').setEmoji('◀️').setStyle(ButtonStyle.Primary);
    const next = new Button().setCustomId('next').setEmoji('▶️').setStyle(ButtonStyle.Primary);
    const last = new Button().setCustomId('last').setEmoji('⏩').setStyle(ButtonStyle.Primary);

    const row = new MessageActionRow().setComponents(first, previous, next, last);

    const message = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });

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
        }

        embed.setFields(pages[page]).setFooter({ text: `Page ${page + 1} of ${pages.length}` });

        receivedInteraction.update({ embeds: [embed] });
    });

    collector.on('end', () => {
        row.setComponents(row.components.map(component => component.setDisabled(true)));

        message.edit({ components: [row] });
    });
}
