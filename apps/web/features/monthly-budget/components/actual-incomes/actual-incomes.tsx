'use client';

import { FC } from 'react';

import { useReadyVM } from '../../budget-scope.context';
import { ActualIncomesVM } from './actual-incomes.vm';
import { ActualIncomesWidget } from './actual-incomes.widget';

export const ActualIncomes: FC<{ className?: string }> = (props) => {
    const vm = useReadyVM(
        (ready, scope) => new ActualIncomesVM(ready, scope.model, scope.commands.addIncome),
    );
    return <ActualIncomesWidget vm={vm} {...props} />;
};
