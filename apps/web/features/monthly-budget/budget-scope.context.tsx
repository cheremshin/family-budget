'use client';

import { type PropsWithChildren, createContext, use, useEffect, useState } from 'react';

import type { Period } from '@family-budget/domain/shared';

import { useQueryClient } from '@/client/container';
import { type Viewer, useObservableValue } from '@/client/core';
import { useSelectedPeriod } from '@/client/month-param';

import { type BudgetScope, createBudgetAdapters, createBudgetScope } from './budget-scope';
import type { PeriodSource, ReadySource } from './model/ports';

const ScopeContext = createContext<BudgetScope | null>(null);
const ReadyContext = createContext<ReadySource | null>(null);

type BudgetScopeProviderT = PropsWithChildren<{ viewer: Viewer; today: Period }>;

export function BudgetScopeProvider({ viewer, today, children }: BudgetScopeProviderT) {
    const queryClient = useQueryClient();
    const selected = useObservableValue(useSelectedPeriod(today));

    const [scope] = useState(() => {
        const period: PeriodSource = {
            get selected() {
                return selected.get();
            },
            today,
        };
        return createBudgetScope(createBudgetAdapters(queryClient, viewer, period), viewer, period);
    });

    useEffect(() => scope.activate(), [scope]);

    return <ScopeContext value={scope}>{children}</ScopeContext>;
}

type ReadyProviderT = PropsWithChildren<{ value: ReadySource }>;

export function ReadyProvider({ value, children }: ReadyProviderT) {
    return <ReadyContext value={value}>{children}</ReadyContext>;
}

export function useBudgetScope(): BudgetScope {
    const scope = use(ScopeContext);

    if (!scope) {
        throw new Error('useBudgetScope must be used in BudgetScopeProvider');
    }

    return scope;
}

export function useReady(): ReadySource {
    const ready = use(ReadyContext);

    if (!ready) {
        throw new Error('useReady must be used in ReadyProvider');
    }

    return ready;
}

/** VM виджета внутри ветки ready */
export function useReadyVM<T>(create: (ready: ReadySource, scope: BudgetScope) => T): T {
    const scope = useBudgetScope();
    const ready = useReady();
    const [vm] = useState(() => create(ready, scope));
    return vm;
}

/** VM виджета вне ветки ready */
export function useScopeVM<T>(create: (scope: BudgetScope) => T): T {
    const scope = useBudgetScope();
    const [vm] = useState(() => create(scope));
    return vm;
}
