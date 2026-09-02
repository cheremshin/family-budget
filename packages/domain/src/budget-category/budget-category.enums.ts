export const budgetCategoryTypeOptions = ['expense', 'savings'] as const;
export type BudgetCategoryType = (typeof budgetCategoryTypeOptions)[number];

export const calculationModeOptions = ['absolute', 'relative'] as const;
export type CalculationMode = (typeof calculationModeOptions)[number];
