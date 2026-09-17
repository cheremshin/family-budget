import { QueryClient } from 'mobx-tanstack-query';

import { Period } from '@family-budget/domain/shared';

import { Viewer } from '@/client/core';
import {
    AddIncomeCommand,
    CreateBudgetCommand,
    MonthlyBudgetCache,
    MonthlyBudgetDeps,
    MonthlyBudgetLiveSync,
    MonthlyBudgetQuery,
    SetPlannedIncomeCommand,
} from '@/client/monthly-budget';

import { ReceiptsStore } from './components/actual-incomes/actual-incomes.store';
import { DateStore } from './components/date-picker/date-picker.store';
import { MembersStore } from './components/member-select/members.store';
import { PlannedIncomeStore } from './components/planned-income/planned-income.store';
import { ScreenStore } from './components/screen/screen.store';
import { BudgetStore } from './stores/budget.store';
import { PeriodStore } from './stores/period.store';
import { SelectionStore } from './stores/selection.store';

export class BudgetVM {
    readonly period: PeriodStore;
    readonly datePicker: DateStore;
    readonly screen: ScreenStore;
    readonly members: MembersStore;
    readonly plannedIncome: PlannedIncomeStore;
    readonly receipts: ReceiptsStore;

    private readonly disposables: { destroy(): void }[];

    constructor(
        queryClient: QueryClient,
        private readonly liveSync: MonthlyBudgetLiveSync,
        viewer: Viewer,
        today: Period,
    ) {
        const deps: MonthlyBudgetDeps = {
            queryClient,
            cache: new MonthlyBudgetCache(queryClient, viewer.familyId),
        };

        // Состояния фичи
        const period = new PeriodStore(today);
        const budgetQuery = new MonthlyBudgetQuery(deps, () => period.selectedPeriod);
        const budget = new BudgetStore(budgetQuery);
        const selection = new SelectionStore(budget, viewer);

        // Команды
        const createBudget = new CreateBudgetCommand(deps);
        const setPlannedIncome = new SetPlannedIncomeCommand(deps);
        const addIncome = new AddIncomeCommand(deps);

        // Фасады виджетов
        this.period = period;
        this.datePicker = new DateStore(budget, period);
        this.screen = new ScreenStore(budget, period, createBudget);
        this.members = new MembersStore(budget, selection);
        this.plannedIncome = new PlannedIncomeStore(budget, selection, setPlannedIncome);
        this.receipts = new ReceiptsStore(budget, selection, addIncome);

        this.disposables = [budget, budgetQuery, createBudget, setPlannedIncome, addIncome];
    }

    connect(): () => void {
        return this.liveSync.retain();
    }

    destroy(): void {
        this.disposables.forEach((disposable) => disposable.destroy());
    }
}
