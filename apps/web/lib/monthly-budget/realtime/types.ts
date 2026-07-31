export type MonthlyBudgetChangedEvent = {
    id: string;
    type: 'monthly-budget.changed';
    occurredAt: string;

    monthlyBudgetId: string;
    familyId: string;
    period: string;

    version: number;
};
