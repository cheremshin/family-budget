import { type CloseBlocker, closeBlockerMessage } from '@family-budget/domain/monthly-budget';

import type { BudgetSnapshot } from '../../model/budget.snapshot';

export type CloseMonthView =
    | { status: 'hidden' }
    | { status: 'blocked'; reason: string }
    | { status: 'available'; isPending: boolean; error: string | null };

export function closeBlockerView(blocker: CloseBlocker | null): { message: string } | null {
    return blocker && { message: closeBlockerMessage(blocker) };
}

export function buildCloseMonthView(
    s: BudgetSnapshot,
    command: { isPending: boolean; error: { message: string } | null },
): CloseMonthView {
    if (s.closeBlocker === 'closed' || s.closeBlocker === 'not-owner') return { status: 'hidden' };
    if (s.closeBlocker) return { status: 'blocked', reason: closeBlockerMessage(s.closeBlocker) };

    return {
        status: 'available',
        isPending: command.isPending,
        error: command.error?.message ?? null,
    };
}
