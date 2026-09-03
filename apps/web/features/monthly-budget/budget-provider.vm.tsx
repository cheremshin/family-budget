'use client';

import { type PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

import { computed, makeObservable } from 'mobx';

import { MonthlyBudget } from '@family-budget/domain/monthly-budget';

import { BudgetView, toBudgetView } from './budget.view';
import { MonthNavigationStore } from './stores/month-navigation.store';
import { MonthlyBudgetLiveStore } from './stores/monthly-budget-live.store';
import { MonthlyBudgetStore } from './stores/monthly-budget.store';
import { DistributionView, toDistributionView } from '@/features/monthly-budget/distribution.view';

export type BudgetInitialData = {
    monthlyBudget: MonthlyBudget;
};

export class BudgetVM {
    readonly navigation: MonthNavigationStore;
    readonly budget: MonthlyBudgetStore;

    private readonly live: MonthlyBudgetLiveStore;

    constructor(
        familyId: string,
        private readonly currentUserId: string,
        initialData?: BudgetInitialData,
    ) {
        this.navigation = new MonthNavigationStore(initialData?.monthlyBudget?.period);
        this.budget = new MonthlyBudgetStore(familyId, this.navigation, initialData?.monthlyBudget);
        this.live = new MonthlyBudgetLiveStore(
            async (event) => await this.budget.refreshIfStale(event.version),
        );
        makeObservable(this);
    }

    @computed
    get view(): BudgetView {
        return toBudgetView(
            this.budget.monthlyBudget,
            this.navigation.selectedPeriod,
            this.currentUserId,
            {
                setPlan: (amount) => this.budget.setPlannedIncomeMutation.mutate(amount),
                addIncome: (amount) => this.budget.addIncomeMutation.mutate(amount),
            },
        );
    }

    @computed
    get distributionView(): DistributionView {
        return toDistributionView(
            this.budget.monthlyBudget,
            this.navigation.selectedPeriod,
            this.currentUserId,
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
    initialData?: BudgetInitialData;
}>;

export function BudgetProvider({ familyId, currentUserId, initialData, children }: ProviderProps) {
    const [vm] = useState<BudgetVM>(() => new BudgetVM(familyId, currentUserId, initialData));

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

export function useBudgetView(): BudgetView {
    return useBudgetVM().view;
}

export function useDistributionView(): DistributionView {
    return useBudgetVM().distributionView;
}
