import { computed, makeObservable } from 'mobx';

import { MonthlyBudget } from '@family-budget/domain/monthly-budget';

import { BudgetState, MonthlyBudgetQuery } from '@/client/monthly-budget';

export class BudgetStore {
    constructor(private readonly query: MonthlyBudgetQuery) {
        makeObservable(this);
    }

    get state(): BudgetState {
        return this.query.state;
    }

    @computed
    get budget(): MonthlyBudget | undefined {
        const state = this.state;
        return state.kind === 'ready' ? state.budget : undefined;
    }

    retry = (): void => this.query.retry();
    destroy = (): void => this.query.destroy();
}
