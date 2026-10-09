export const budgetDivisionTypeOptions = ['in_half', 'in_proportion'] as const;
export type BudgetDivisionType = (typeof budgetDivisionTypeOptions)[number];

export const personalRemainderPolicyOptions = ['individual', 'equalized'] as const;
export type PersonalRemainderPolicy = (typeof personalRemainderPolicyOptions)[number];
