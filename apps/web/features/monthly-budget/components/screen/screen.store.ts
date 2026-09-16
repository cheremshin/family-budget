import { computed, makeObservable } from 'mobx';

import { CreateBudgetCommand } from '@/client/monthly-budget';

import { BudgetStore } from '../../stores/budget.store';
import { PeriodStore } from '../../stores/period.store';
import { ScreenView } from './screen.view';

export class ScreenStore {
    constructor(
        private readonly budgetStore: BudgetStore,
        private readonly periodStore: PeriodStore,
        private readonly createBudget: CreateBudgetCommand,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): ScreenView {
        const state = this.budgetStore.state;

        switch (state.kind) {
            case 'loading':
                return { status: 'loading' };
            case 'error':
                return {
                    status: 'error',
                    message: state.error.message,
                    canRetry: state.error.isRetryable,
                };
            case 'not-started':
                return {
                    status: 'not-started',
                    isPast: this.periodStore.isPast,
                    isCreating: this.createBudget.isPending,
                    error: this.createBudget.error?.message ?? null,
                };
            case 'ready':
                return {
                    status: 'ready',
                    syncError: state.syncError?.message ?? null,
                };
        }
    }

    retry = (): void => this.budgetStore.retry();

    create = async (): Promise<void> => {
        const state = this.budgetStore.state;
        if (state.kind !== 'not-started' || this.createBudget.isPending) return;

        this.createBudget.run(state.period);
    };
}
