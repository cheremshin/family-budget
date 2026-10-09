import type { MonthlyBudget } from '@family-budget/domain/monthly-budget';
import type { Period } from '@family-budget/domain/shared';

import { ResourceQuery } from '../core';
import { type MonthlyBudgetDeps, monthlyBudgetKeys } from './monthly-budget.cache';
import { fetchMonthlyBudget } from './monthly-budget.read';

type MonthlyBudgetKey = ReturnType<typeof monthlyBudgetKeys.period>;

export class MonthlyBudgetQuery extends ResourceQuery<MonthlyBudget | null, MonthlyBudgetKey> {
    constructor({ queryClient, cache }: MonthlyBudgetDeps, period: () => Period) {
        super({
            queryClient,
            queryKey: () => cache.key(period()),
            fetch: async ([, , keyPeriod], signal) =>
                cache.reconcile(keyPeriod, await fetchMonthlyBudget(keyPeriod, signal)),
        });
    }
}
