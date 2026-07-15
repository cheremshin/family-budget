export const budgetCategoryTypeOptions = ['expense', 'savings'] as const;
export type BudgetCategoryType = (typeof budgetCategoryTypeOptions)[number];

export const calculationModeOptions = ['absolute', 'relative'] as const;
export type CalculationMode = (typeof calculationModeOptions)[number];

export type BudgetCategory = {
    id: string;
    name: string;
    type: BudgetCategoryType;
    calculationMode: CalculationMode;
    targetAmount: string;
    sortOrder: number;
    isSystem: boolean;
};
