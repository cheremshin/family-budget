'use client';

import { useSearchParams } from 'next/navigation';

import { PERIOD_PARAM, Period, resolvePeriodParam } from '@family-budget/domain/shared';

export function useSelectedPeriod(today: Period, param = PERIOD_PARAM): Period {
    return resolvePeriodParam(useSearchParams().get(param), today);
}
