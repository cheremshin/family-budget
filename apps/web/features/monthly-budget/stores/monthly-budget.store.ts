import { action, computed } from 'mobx';
import { Mutation, Query } from 'mobx-tanstack-query';

import { MonthlyBudget } from '@family-budget/domain/monthly-budget';

import { queryClient } from '@/lib/query-client';

import * as budgetActions from '../lib/monthly-budget.actions';
import { MonthNavigationStore } from './month-navigation.store';

function monthlyBudgetKey(familyId: string, period: string) {
    return ['monthly-budget', familyId, period] as const;
}

export class MonthlyBudgetStore {
    private readonly abortController = new AbortController();

    readonly query;
    readonly setPlannedIncomeMutation;
    readonly addIncomeMutation;

    constructor(
        private readonly familyId: string,
        private readonly currentUserId: string,
        private readonly navigation: MonthNavigationStore,
        initialData?: MonthlyBudget,
    ) {
        this.query = new Query({
            queryClient,
            abortSignal: this.abortController.signal,
            initialData: initialData ? () => initialData : undefined,
            queryKey: () => monthlyBudgetKey(this.familyId, this.navigation.selectedPeriod),
            queryFn: async ({ queryKey }) => {
                const [, , period] = queryKey;
                return budgetActions.getMonthlyBudget(period);
            },
        });

        this.setPlannedIncomeMutation = new Mutation({
            queryClient,
            abortSignal: this.abortController.signal,
            mutationFn: (plannedAmount: string) =>
                budgetActions.setPlannedIncome({
                    plannedAmount,
                    period: this.navigation.selectedPeriodAsDate,
                }),
            onSuccess: (budget) => this.updateCache(budget),
        });

        this.addIncomeMutation = new Mutation({
            queryClient,
            abortSignal: this.abortController.signal,
            mutationFn: (input: { amount: string; receivedAt: Date }) => {
                const plannedIncomeId = this.currentUserPlannedIncome?.id;
                if (!plannedIncomeId) {
                    throw new Error('Невозможно добавить реальных доход до установки планового');
                }
                return budgetActions.addIncome({
                    period: this.navigation.selectedPeriodAsDate,
                    ...input,
                });
            },
        });
    }

    @computed
    get monthlyBudget() {
        return this.query.data;
    }

    @computed
    get currentUserPlannedIncome() {
        return (
            this.monthlyBudget?.plannedIncomes.find((pi) => pi.memberId === this.currentUserId) ??
            null
        );
    }

    @computed
    get stage(): 'set-planned' | 'collect-actual' {
        return this.currentUserPlannedIncome ? 'collect-actual' : 'set-planned';
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
        queryClient.setQueryData(
            monthlyBudgetKey(this.familyId, budget.period),
            (old?: MonthlyBudget) => (!old || budget.version > old.version ? budget : old),
        );
    }

    destroy(): void {
        this.abortController.abort();
    }
}
