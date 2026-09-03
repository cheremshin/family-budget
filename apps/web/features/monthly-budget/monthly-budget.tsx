'use client';

import { FC } from 'react';

import { BudgetInitialData, BudgetProvider } from './budget-provider.vm';
import { Distribution } from './components/distribution/distribution';
import { Incomes } from './components/incomes/incomes';

type PropsT = {
    familyId: string;
    currentUserId: string;
    initialData?: BudgetInitialData;
};

export const MonthlyBudget: FC<PropsT> = ({ familyId, currentUserId, initialData }) => {
    return (
        <BudgetProvider familyId={familyId} currentUserId={currentUserId} initialData={initialData}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <Incomes className="lg:w-80 lg:shrink-0" />
                <Distribution className="lg:flex-1" />
            </div>
        </BudgetProvider>
    );
};
