'use client';

import { FC } from 'react';

import { Period } from '@family-budget/domain/shared';

import { Viewer } from '@/client/core';

import { DatePickerWidget } from './components/date-picker/date-picker.widget';
import { BudgetScreen } from './components/screen/budget-screen';
import { useBudgetVM } from './use-budget-vm';

type MonthlyBudgetT = {
    viewer: Viewer;
    today: Period;
};

export const MonthlyBudget: FC<MonthlyBudgetT> = ({ viewer, today }) => {
    const vm = useBudgetVM(viewer, today);
    return (
        <div className="flex flex-col gap-6">
            <DatePickerWidget store={vm.datePicker} />
            <BudgetScreen vm={vm} />
        </div>
    );
};
