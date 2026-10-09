import { computed, makeObservable } from 'mobx';

import type { Period } from '@family-budget/domain/shared';

import type { Command, CommandResult } from '@/client/core';

export type CreateBudgetView = {
    isPast: boolean;
    isCreating: boolean;
    error: string | null;
};

export class CreateBudgetVM {
    constructor(
        private readonly period: Period,
        private readonly isPast: boolean,
        private readonly createBudget: Command<Period>,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): CreateBudgetView {
        return {
            isPast: this.isPast,
            isCreating: this.createBudget.isPending,
            error: this.createBudget.error?.message ?? null,
        };
    }

    create = (): Promise<CommandResult> => {
        this.createBudget.reset();
        return this.createBudget.run(this.period);
    };
}
