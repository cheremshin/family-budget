'use client';

import { PERIOD_PARAM, Period, resolvePeriodParam } from "@family-budget/domain/shared";
import { useSearchParams } from "next/navigation";

export function useSelectedPeriod(today: Period, param = PERIOD_PARAM): Period {
    return resolvePeriodParam(useSearchParams().get(param), today);
}
