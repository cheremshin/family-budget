'use client';

import { type PropsWithChildren, useMemo } from 'react';

import type { Period } from '@family-budget/domain/shared';

import { ReadyProvider } from '../../budget-scope.context';
import type { BudgetModel } from '../../model/budget.model';
import type { ReadySource } from '../../model/ports';

type ReadyGateT = PropsWithChildren<{ model: BudgetModel; period: Period }>;

export function ReadyGate({ model, period, children }: ReadyGateT) {
    const ready = useMemo<ReadySource>(() => {
        let last = model.snapshot!;

        return {
            period,
            get snapshot() {
                const next = model.snapshot;
                if (next && next.period === period) last = next;
                return last;
            },
        };
    }, [model, period]);

    return <ReadyProvider value={ready}>{children}</ReadyProvider>;
}
