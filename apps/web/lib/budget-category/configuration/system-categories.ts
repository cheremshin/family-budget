import { NewBudgetCategory } from '@family-budget/database';

export const SYSTEM_CATEGORIES: Omit<NewBudgetCategory, 'familyId'>[] = [
    {
        name: 'Накопления',
        type: 'savings',
        calculationMode: 'relative',
        targetAmount: '10',
        isSystem: true,
        sortOrder: 0,
    },
    {
        name: 'Обязательные расходы',
        type: 'expense',
        calculationMode: 'absolute',
        targetAmount: '50000',
        isSystem: true,
        sortOrder: 0,
    },
] as const;
