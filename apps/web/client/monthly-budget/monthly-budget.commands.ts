import {
    AddIncomeInput,
    AddPlannedIncomeInput,
    MonthlyBudget,
} from '@family-budget/domain/monthly-budget';
import { Period } from '@family-budget/domain/shared';

import { callAction } from '../core';
import { MutationCommand } from '../core/command';
import {
    addIncomeAction,
    createMonthlyBudget,
    setPlannedIncomeAction,
} from './monthly-budget.actions';
import { MonthlyBudgetDeps } from './monthly-budget.cache';

abstract class BudgetCommand<In> extends MutationCommand<In, MonthlyBudget> {
    protected constructor(
        { queryClient, cache }: MonthlyBudgetDeps,
        execute: (input: In) => Promise<MonthlyBudget>,
    ) {
        super({ queryClient, execute, onDone: (budget) => cache.write(budget) });
    }
}

export class CreateBudgetCommand extends BudgetCommand<Period> {
    constructor(deps: MonthlyBudgetDeps) {
        super(deps, (period) => callAction(createMonthlyBudget, { period }));
    }
}

export class SetPlannedIncomeCommand extends BudgetCommand<AddPlannedIncomeInput> {
    constructor(deps: MonthlyBudgetDeps) {
        super(deps, (input) => callAction(setPlannedIncomeAction, input));
    }
}

export class AddIncomeCommand extends BudgetCommand<AddIncomeInput> {
    constructor(deps: MonthlyBudgetDeps) {
        super(deps, (input) => callAction(addIncomeAction, input));
    }
}
