'use client';

import { FC } from 'react';

import { useReadyVM } from '../../budget-scope.context';
import { PlannedIncomeVM } from './planned-income.vm';
import { PlannedIncomeWidget } from './planned-income.widget';

export const PlannedIncome: FC<{ className?: string }> = (props) => {
    const vm = useReadyVM(
        (ready, scope) => new PlannedIncomeVM(ready, scope.commands.setPlannedIncome),
    );
    return <PlannedIncomeWidget vm={vm} {...props} />;
};
