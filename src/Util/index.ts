export * from './Mongo';

export const kStructureType = Symbol('structureType');

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
