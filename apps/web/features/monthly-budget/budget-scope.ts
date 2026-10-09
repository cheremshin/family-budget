import type { QueryClient } from 'mobx-tanstack-query';

import type {
    AddIncomeInput,
    AddPlannedIncomeInput,
    CloseMonthlyBudgetInput,
} from '@family-budget/domain/monthly-budget';
import type { Period } from '@family-budget/domain/shared';

import type { Command, Viewer } from '@/client/core';
import {
    AddIncomeCommand,
    CloseMonthCommand,
    CreateBudgetCommand,
    MonthlyBudgetCache,
    type MonthlyBudgetDeps,
    MonthlyBudgetQuery,
    SetPlannedIncomeCommand,
    getMonthlyBudgetLiveSync,
} from '@/client/monthly-budget';

import { BudgetModel } from './model/budget.model';
import type { BudgetSource, PeriodSource } from './model/ports';

export type BudgetCommands = {
    createBudget: Command<Period>;
    setPlannedIncome: Command<AddPlannedIncomeInput>;
    addIncome: Command<AddIncomeInput>;
    closeMonth: Command<CloseMonthlyBudgetInput>;
};

export type BudgetAdapters = {
    source: BudgetSource;
    commands: BudgetCommands;
    activate(): () => void;
};

export function createBudgetAdapters(
    queryClient: QueryClient,
    viewer: Viewer,
    period: PeriodSource,
): BudgetAdapters {
    const deps: MonthlyBudgetDeps = {
        queryClient,
        cache: new MonthlyBudgetCache(queryClient, viewer.familyId),
    };
    const liveSync = getMonthlyBudgetLiveSync(queryClient);

    return {
        source: new MonthlyBudgetQuery(deps, () => period.selected),
        commands: {
            createBudget: new CreateBudgetCommand(deps),
            setPlannedIncome: new SetPlannedIncomeCommand(deps),
            addIncome: new AddIncomeCommand(deps),
            closeMonth: new CloseMonthCommand(deps),
        },
        activate: () => liveSync.retain(),
    };
}

export function createBudgetScope(adapters: BudgetAdapters, viewer: Viewer, period: PeriodSource) {
    return {
        model: new BudgetModel({
            source: adapters.source,
            viewer: viewer,
            period: period,
        }),
        commands: adapters.commands,
        activate: adapters.activate,
    } as const;
}

export type BudgetScope = ReturnType<typeof createBudgetScope>;
