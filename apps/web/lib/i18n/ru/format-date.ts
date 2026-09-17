import { IsoDate } from '@family-budget/domain/shared';

export function formatDate(date: IsoDate, locale = 'ru-RU'): string {
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC',
    }).format(new Date(date));
}

export function formatDateWide(date: IsoDate, locale = 'ru-RU'): string {
    return new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(date));
}

export function formatMonthShort(date: IsoDate, locale = 'ru-RU'): string {
    return new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(
        new Date(date),
    );
}
