import type {
    DistributionResult,
    Income,
    MemberIncome,
    MonthlyBudget,
} from '@family-budget/domain/monthly-budget';
import type { Period } from '@family-budget/domain/shared';

import type { Viewer } from '@/client/core';

import { resolveDistribution } from './distribution';
import {
    type CloseBlocker,
    type PlanLock,
    type ReceiptLock,
    closeBlockerOf,
    planLockOf,
    receiptLockOf,
} from './locks';

export type BudgetSnapshot = {
    budget: MonthlyBudget;
    viewer: Viewer;
    period: Period;
    today: Period;
    member: MemberIncome;
    isViewingSelf: boolean;
    receipt: Income | undefined;
    distribution: DistributionResult | undefined;
    planLock: PlanLock | null;
    receiptLock: ReceiptLock | null;
    closeBlocker: CloseBlocker | null;
};

type SnapshotInput = {
    budget: MonthlyBudget;
    viewer: Viewer;
    today: Period;
    memberId: string;
    receiptId: string | null;
};

export function toBudgetSnapshot({
    budget,
    viewer,
    today,
    memberId,
    receiptId,
}: SnapshotInput): BudgetSnapshot {
    const members: MemberIncome[] = budget.memberIncomes;

    const member =
        members.find((item) => item.memberId === memberId) ??
        members.find((item) => item.memberId === viewer.userId) ??
        members[0];
    const isViewingSelf = member.memberId === viewer.userId;

    return {
        budget,
        viewer,
        today,
        period: budget.period,
        member,
        isViewingSelf,
        receipt:
            receiptId === null
                ? undefined
                : member.incomeReceipts.find((receipt) => receipt.id === receiptId),
        distribution: resolveDistribution(budget),
        planLock: planLockOf(budget, isViewingSelf),
        receiptLock: receiptLockOf(isViewingSelf),
        closeBlocker: closeBlockerOf(budget, viewer),
    };
}
