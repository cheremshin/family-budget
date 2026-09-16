import { computed, makeObservable } from 'mobx';
import { Query } from 'mobx-tanstack-query';

import type { MonthlyBudget } from '@family-budget/domain/monthly-budget';
import type { Period } from '@family-budget/domain/shared';

import { type ClientError, toClientError } from '../core';
import { MonthlyBudgetDeps } from './monthly-budget.cache';
import { fetchMonthlyBudget } from './monthly-budget.read';

export type BudgetState =
    | { kind: 'loading' }
    | { kind: 'error'; error: ClientError }
    | { kind: 'not-started'; period: Period }
    | { kind: 'ready'; budget: MonthlyBudget; syncError: ClientError | null };

export class MonthlyBudgetQuery {
    private readonly query;

    constructor(
        { queryClient, cache }: MonthlyBudgetDeps,
        private readonly period: () => Period,
    ) {
        this.query = new Query({
            queryClient,
            lazy: true,
            queryKey: () => cache.key(this.period()),
            queryFn: async ({ queryKey }) => {
                const [, , period] = queryKey;
                return cache.reconcile(period, await fetchMonthlyBudget(period));
            },
        });

        makeObservable(this);
    }

    @computed
    get state(): BudgetState {
        const { data, error } = this.query;
        const clientError = error ? toClientError(error) : null;

        if (data) {
            return {
                kind: 'ready',
                budget: data,
                syncError: clientError,
            };
        }

        if (data === null) {
            return {
                kind: 'not-started',
                period: this.period(),
            };
        }

        if (clientError) {
            return {
                kind: 'error',
                error: clientError,
            };
        }

        return { kind: 'loading' };
    }

    get isFetching(): boolean {
        return this.query.isFetching;
    }

    retry(): void {
        void this.query.refetch();
    }

    destroy(): void {
        void this.query.destroy();
    }
}
