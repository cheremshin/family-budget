'use client';

import { FC } from 'react';

import { BudgetInitialData, BudgetProvider } from './budget-provider.vm';
import { Incomes } from './components/incomes/incomes';

type PropsT = {
    familyId: string;
    currentUserId: string;
    initialData?: BudgetInitialData;
};

export const MonthlyBudget: FC<PropsT> = ({ familyId, currentUserId, initialData }) => {
    return (
        <BudgetProvider familyId={familyId} currentUserId={currentUserId} initialData={initialData}>
            <Incomes />
        </BudgetProvider>
    );
};
