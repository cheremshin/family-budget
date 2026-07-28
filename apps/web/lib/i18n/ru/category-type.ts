import { BudgetCategoryType } from '@family-budget/domain/budget-category';

export const categoryTypeLabels = {
    expense: 'Расходы',
    savings: 'Накопления',
} satisfies Record<BudgetCategoryType, string>;
