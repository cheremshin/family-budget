import { CalculationMode } from '@family-budget/domain/budget-category';

export const calculationModeLabels = {
    absolute: 'Фиксированная сумма',
    relative: 'Процент от дохода',
} satisfies Record<CalculationMode, string>;
