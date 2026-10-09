import type { MemberIncome, MonthlyBudget } from '@family-budget/domain/monthly-budget';

import type { Viewer } from '@/client/core';

export type PlanLock = 'closed' | 'foreign';
export type ReceiptLock = 'foreign';
export type CloseBlocker = 'not-owner' | 'closed' | 'plan-incomplete';

export function planLockOf(budget: MonthlyBudget, isViewingSelf: boolean): PlanLock | null {
    if (budget.isClosed) return 'closed';
    return isViewingSelf ? null : 'foreign';
}

export function receiptLockOf(isViewingSelf: boolean): ReceiptLock | null {
    return isViewingSelf ? null : 'foreign';
}

export function closeBlockerOf(budget: MonthlyBudget, viewer: Viewer): CloseBlocker | null {
    if (!viewer.isOwner) return 'not-owner';
    if (budget.isClosed) return 'closed';

    const members: MemberIncome[] = budget.memberIncomes;
    return members.every((member) => member.plannedAmount !== null) ? null : 'plan-incomplete';
}
