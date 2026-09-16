'use client';

import { useEffect, useRef, useState } from 'react';

import { Period } from '@family-budget/domain/shared';

import { useQueryClient } from '@/client/container';
import { Viewer } from '@/client/core';
import { getMonthlyBudgetLiveSync } from '@/client/monthly-budget';

import { BudgetVM } from './budget.vm';

export function useBudgetVM(viewer: Viewer, today: Period): BudgetVM {
    const queryClient = useQueryClient();
    const [vm] = useState(
        () => new BudgetVM(queryClient, getMonthlyBudgetLiveSync(queryClient), viewer, today),
    );
    const destroyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        clearTimeout(destroyTimer.current);
        const release = vm.connect();

        return () => {
            release();
            destroyTimer.current = setTimeout(() => vm.destroy(), 0);
        };
    }, [vm]);

    return vm;
}
