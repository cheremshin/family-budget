export function formatPercent(value: string, locale = 'ru-RU'): string {
    return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(
        Number(value) / 100,
    );
}
