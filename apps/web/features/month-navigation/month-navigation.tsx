'use client';

import { useSelectedPeriod } from "@/client/month-param";
import { Period } from "@family-budget/domain/shared";
import { FC } from "react";
import { useMonthNavigation } from "./use-month-navigation";
import { MonthPicker } from "@/components/month-picker";

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
