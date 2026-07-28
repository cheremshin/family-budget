import { CalculationMode } from '@family-budget/domain/budget-category';

export const calculationModeLabels = {
    absolute: 'Фиксированная сумма',
    relative: 'Процент от дохода',
} satisfies Record<CalculationMode, string>;

type FormatMoneyOptions = {
    mode: CalculationMode;
    locale: string;
    currency: string;
};

export function formatMoney(
    amount: string,
    options: FormatMoneyOptions = { mode: 'absolute', locale: 'ru-RU', currency: 'RUB' },
) {
    switch (options.mode) {
        case 'absolute':
            return new Intl.NumberFormat(options.locale, {
                style: 'currency',
                currency: options.currency,
            }).format(Number(amount));
        case 'relative':
            return amount + '%';
        default:
            return amount;
    }
}
