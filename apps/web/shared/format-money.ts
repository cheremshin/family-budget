export function formatMoney(amount: string, locale = 'ru-RU', currency = 'RUB'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(amount));
}
