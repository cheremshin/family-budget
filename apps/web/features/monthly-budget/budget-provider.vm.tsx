'use client';

import { type PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

import { MonthlyBudget } from '@family-budget/domain/monthly-budget';

import { MonthNavigationStore } from './stores/month-navigation.store';
import { MonthlyBudgetLiveStore } from './stores/monthly-budget-live.store';
import { MonthlyBudgetStore } from './stores/monthly-budget.store';

export type BudgetInitialData = {
    monthlyBudget: MonthlyBudget;
};

export class BudgetVM {
    readonly navigation: MonthNavigationStore;
    readonly budget: MonthlyBudgetStore;

    private readonly live: MonthlyBudgetLiveStore;

    constructor(familyId: string, currentUserId: string, initialData: BudgetInitialData) {
        this.navigation = new MonthNavigationStore(initialData.monthlyBudget.period);
        this.budget = new MonthlyBudgetStore(
            familyId,
            currentUserId,
            this.navigation,
            initialData.monthlyBudget,
        );
        this.live = new MonthlyBudgetLiveStore(
            async (event) => await this.budget.refreshIfStale(event.version),
        );
    }

    connect(): void {
        this.live.connect();
    }

    destroy(): void {
        this.live.disconnect();
        this.budget.destroy();
    }
}

const BudgetVMContext = createContext<BudgetVM | null>(null);

type ProviderProps = PropsWithChildren<{
    familyId: string;
    currentUserId: string;
    initialData: BudgetInitialData;
}>;

export function BudgetProvider({ familyId, currentUserId, initialData, children }: ProviderProps) {
    const [vm] = useState<BudgetVM>(new BudgetVM(familyId, currentUserId, initialData));

    useEffect(() => {
        vm.connect();
        return () => vm.destroy();
    }, [vm]);

    return <BudgetVMContext value={vm}>{children}</BudgetVMContext>;
}

export function useBudgetVM(): BudgetVM {
    const vm = useContext(BudgetVMContext);

    if (!vm) {
        throw new Error('useBudgetVM must be used inside BudgetProvider');
    }

    return vm;
}

export function useBudgetStore(): MonthlyBudgetStore {
    return useBudgetVM().budget;
}

export function useNavigationStore(): MonthNavigationStore {
    return useBudgetVM().navigation;
}
