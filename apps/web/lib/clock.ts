import { type Period, toPeriod } from '@family-budget/domain/shared';

/** Считается серверными часами */
export function getCurrentPeriod(): Period {
    return toPeriod(new Date());
}
