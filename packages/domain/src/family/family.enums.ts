export const budgetDivisionTypeOptions = ['in_half', 'in_proportion'] as const;
export type BudgetDivisionType = (typeof budgetDivisionTypeOptions)[number];
