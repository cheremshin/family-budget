'use client';

import { FC } from 'react';

import { Period } from '@family-budget/domain/shared';

import { Viewer } from '@/client/core';

import { BudgetScreen } from './components/screen/budget-screen';
import { useBudgetVM } from './use-budget-vm';

type MonthlyBudgetT = {
    viewer: Viewer;
    today: Period;
};

export const MonthlyBudget: FC<MonthlyBudgetT> = ({ viewer, today }) => {
    const vm = useBudgetVM(viewer, today);
    return <BudgetScreen vm={vm} />;
};
