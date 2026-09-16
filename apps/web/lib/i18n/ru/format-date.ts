import { IsoDate } from '@family-budget/domain/shared';

export function formatDate(date: IsoDate, locale = 'ru-RU'): string {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(
        new Date(date),
    );
}
