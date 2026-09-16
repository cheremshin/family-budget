import { MonthlyBudget } from '@family-budget/domain/monthly-budget';
import { Period } from '@family-budget/domain/shared';

import { callAction } from '../core';
import { getMonthlyBudgetAction } from './monthly-budget.actions';
import { monthlyBudgetKeys } from './monthly-budget.cache';

export function fetchMonthlyBudget(period: Period): Promise<MonthlyBudget | null> {
    return callAction(getMonthlyBudgetAction, { period });
}

export function monthlyBudgetPrefetch(familyId: string, period: Period) {
    return {
        queryKey: monthlyBudgetKeys.period(familyId, period),
        queryFn: () => fetchMonthlyBudget(period),
    };
}
