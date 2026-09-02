import { action, computed, makeObservable } from 'mobx';
import { Mutation, Query } from 'mobx-tanstack-query';
import z from 'zod';

import { MonthlyBudget, incomeFieldsSchema } from '@family-budget/domain/monthly-budget';
import { Period } from '@family-budget/domain/shared';

import { getQueryClient } from '@/lib/query-client';
import { unwrapAction } from '@/lib/safe-action';

import {
    addIncomeAction,
    getMonthlyBudgetAction,
    setPlannedIncomeAction,
} from '../lib/monthly-budget.actions';
import { MonthNavigationStore } from './month-navigation.store';

function monthlyBudgetKey(familyId: string, period: Period) {
    return ['monthly-budget', familyId, period] as const;
}

export class MonthlyBudgetStore {
    private readonly abortController = new AbortController();
    private readonly queryClient = getQueryClient();

    readonly query;
    readonly setPlannedIncomeMutation;
    readonly addIncomeMutation;

    constructor(
        private readonly familyId: string,
        private readonly navigation: MonthNavigationStore,
        initialData?: MonthlyBudget,
    ) {
        this.query = new Query({
            queryClient: this.queryClient,
            abortSignal: this.abortController.signal,
            initialData: initialData ? () => initialData : undefined,
            queryKey: () => monthlyBudgetKey(this.familyId, this.navigation.selectedPeriod),
            queryFn: async ({ queryKey }) => {
                const [, , period] = queryKey;
                return unwrapAction(await getMonthlyBudgetAction({ period }));
            },
        });

        this.setPlannedIncomeMutation = new Mutation({
            queryClient: this.queryClient,
            abortSignal: this.abortController.signal,
            mutationFn: async (plannedAmount: string) =>
                unwrapAction(
                    await setPlannedIncomeAction({
                        amount: plannedAmount,
                        period: this.navigation.selectedPeriod,
                    }),
                ),
            onSuccess: (budget) => this.updateCache(budget),
        });

        this.addIncomeMutation = new Mutation({
            queryClient: this.queryClient,
            abortSignal: this.abortController.signal,
            mutationFn: async (input: z.infer<typeof incomeFieldsSchema>) =>
                unwrapAction(
                    await addIncomeAction({
                        period: this.navigation.selectedPeriod,
                        receivedAt: input.receivedAt,
                        amount: input.amount,
                    }),
                ),
            onSuccess: (budget) => this.updateCache(budget),
        });

        if (initialData) {
            this.updateCache(initialData);
        }

        makeObservable(this);
    }

    @computed
    get monthlyBudget() {
        return this.query.data;
    }

    @action
    async refreshIfStale(version: number): Promise<void> {
        const currentVersion = this.monthlyBudget?.version ?? 0;

        if (currentVersion >= version) {
            return;
        }

        await this.query.refetch();
    }

    @action
    private updateCache(budget: MonthlyBudget): void {
        this.queryClient.setQueryData(
            monthlyBudgetKey(this.familyId, budget.period),
            (old?: MonthlyBudget) => (!old || budget.version > old.version ? budget : old),
        );
    }

    destroy(): void {
        this.abortController.abort();
    }
}
