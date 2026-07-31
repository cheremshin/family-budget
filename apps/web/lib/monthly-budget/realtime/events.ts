import { MonthlyBudgetChangedEvent } from './types';

export function createMonthlyBudgetChangedEvent(data: {
    monthlyBudgetId: string;
    familyId: string;
    period: string;
    version: number;
}): MonthlyBudgetChangedEvent {
    return {
        id: crypto.randomUUID(),
        type: 'monthly-budget.changed',
        occurredAt: new Date().toISOString(),

        monthlyBudgetId: data.monthlyBudgetId,
        familyId: data.familyId,
        period: data.period,

        version: data.version,
    };
}
