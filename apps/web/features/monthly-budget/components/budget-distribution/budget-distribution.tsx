'use client';

import { FC } from 'react';

import { useReadyVM } from '../../budget-scope.context';
import { BudgetDistributionVM } from './budget-distribution.vm';
import { BudgetDistributionWidget } from './budget-distribution.widget';

export const BudgetDistribution: FC<{ className?: string }> = (props) => {
    const vm = useReadyVM((ready) => new BudgetDistributionVM(ready));
    return <BudgetDistributionWidget vm={vm} {...props} />;
};
