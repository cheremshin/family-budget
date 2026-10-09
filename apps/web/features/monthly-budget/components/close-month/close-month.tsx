'use client';

import { FC } from 'react';

import { useReadyVM } from '../../budget-scope.context';
import { CloseMonthVM } from './close-month.vm';
import { CloseMonthWidget } from './close-month.widget';

export const CloseMonth: FC<{ className?: string }> = (props) => {
    const vm = useReadyVM((ready, scope) => new CloseMonthVM(ready, scope.commands.closeMonth));
    return <CloseMonthWidget vm={vm} {...props} />;
};
