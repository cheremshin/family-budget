'use client';

import { FC } from 'react';

import { Period } from '@family-budget/domain/shared';

import { useSelectedPeriod } from '@/client/month-param';
import { MonthPicker } from '@/components/month-picker';

import { useMonthNavigation } from './use-month-navigation';

type MonthNavigationProps = {
    today: Period;
    param?: string;
    className?: string;
};

export const MonthNavigation: FC<MonthNavigationProps> = ({ today, param, className }) => {
    const value = useSelectedPeriod(today, param);
    const navigate = useMonthNavigation(param);

    return <MonthPicker value={value} today={today} onChange={navigate} className={className} />;
};
