import { QueryClient } from 'mobx-tanstack-query';

import { MonthlyBudget } from '@family-budget/domain/monthly-budget';
import { Period } from '@family-budget/domain/shared';

export const monthlyBudgetKeys = {
    all: () => ['monthly-budget'] as const,
    family: (familyId: string) => ['monthly-budget', familyId] as const,
    period: (familyId: string, period: Period) => ['monthly-budget', familyId, period] as const,
};

export class MonthlyBudgetCache {
    constructor(
        private readonly queryClient: QueryClient,
        private readonly familyId: string,
    ) {}

    key(period: Period) {
        return monthlyBudgetKeys.period(this.familyId, period);
    }

    read(period: Period): MonthlyBudget | null | undefined {
        return this.queryClient.getQueryData<MonthlyBudget | null>(this.key(period));
    }

    reconcile(period: Period, next: MonthlyBudget | null): MonthlyBudget | null {
        return this.pickFresher(this.read(period), next);
    }

    write(budget: MonthlyBudget): void {
        this.queryClient.setQueryData<MonthlyBudget | null>(this.key(budget.period), (old) =>
            this.pickFresher(old, budget),
        );
    }

    private pickFresher(
        old: MonthlyBudget | null | undefined,
        next: MonthlyBudget | null,
    ): MonthlyBudget | null {
        if (!old || !next) return next ?? old ?? null;

        return next.version >= old.version ? next : old;
    }
}

export type MonthlyBudgetDeps = {
    queryClient: QueryClient;
    cache: MonthlyBudgetCache;
};
