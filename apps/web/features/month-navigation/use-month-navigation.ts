'use client';

import { useCallback } from 'react';

import { PERIOD_PARAM, type Period, toPeriodParam } from '@family-budget/domain/shared';

export function useMonthNavigation(param = PERIOD_PARAM): (period: Period) => void {
    return useCallback(
        (period: Period) => {
            const params = new URLSearchParams(window.location.search);
            const next = toPeriodParam(period);
            if (params.get(param) === next) return;

            params.set(param, next);
            window.history.pushState(null, '', `?${params}`);
        },
        [param],
    );
}
