import type { BudgetSnapshot } from '../../model/budget.snapshot';
import type { CloseBlocker } from '../../model/locks';

export type CloseMonthView =
    { status: 'hidden' } | { status: 'available'; isPending: boolean; error: string | null };

const BLOCKER_MESSAGES: Record<CloseBlocker, string> = {
    'not-owner': 'Зафиксировать месяц может только владелец семьи',
    closed: 'Месяц уже зафиксирован',
    'plan-incomplete': 'Не все участники установили план',
};

export function closeBlockerView(blocker: CloseBlocker | null): { message: string } | null {
    return blocker && { message: BLOCKER_MESSAGES[blocker] };
}

export function buildCloseMonthView(
    s: BudgetSnapshot,
    command: { isPending: boolean; error: { message: string } | null },
): CloseMonthView {
    if (s.closeBlocker) return { status: 'hidden' };

    return {
        status: 'available',
        isPending: command.isPending,
        error: command.error?.message ?? null,
    };
}
