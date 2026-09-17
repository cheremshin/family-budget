import { FC } from 'react';

import { ActualIncomesSkeleton } from '../actual-incomes/actual-incomes.skeleton';
import { MemberSelectSkeleton } from '../member-select/member-select.skeleton';
import { PlannedIncomeSkeleton } from '../planned-income/planned-income.skeleton';
import { BudgetLayout } from './budget-layout';

export const BudgetSkeleton: FC = () => (
    <BudgetLayout>
        <MemberSelectSkeleton />
        <PlannedIncomeSkeleton />
        <ActualIncomesSkeleton />
    </BudgetLayout>
);
