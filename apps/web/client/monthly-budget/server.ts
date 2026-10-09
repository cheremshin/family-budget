import type { Period } from '@family-budget/domain/shared';

import { monthlyBudgetService } from '@/lib/monthly-budget';

import { monthlyBudgetKeys } from './monthly-budget.cache';

export function monthlyBudgetPrefetch(familyId: string, period: Period) {
    return {
        queryKey: monthlyBudgetKeys.period(familyId, period),
        queryFn: async () =>
            (await monthlyBudgetService.getMonthlyBudget(familyId, period)) ?? null,
    };
}
