import {
    type CloseBlocker,
    type DistributionResult,
    type Income,
    type MemberIncome,
    type MonthlyBudget,
    type PlanBlocker,
    type ReceiptBlocker,
    closeBlockerOf,
    distributionOf,
    planBlockerOf,
    receiptBlockerOf,
} from '@family-budget/domain/monthly-budget';
import type { Period } from '@family-budget/domain/shared';

import { type Viewer, toActor } from '@/client/core';

export type BudgetSnapshot = {
    budget: MonthlyBudget;
    viewer: Viewer;
    period: Period;
    today: Period;
    member: MemberIncome;
    isViewingSelf: boolean;
    receipt: Income | undefined;
    distribution: DistributionResult | undefined;
    planBlocker: PlanBlocker | null;
    receiptBlocker: ReceiptBlocker | null;
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
    const actor = toActor(viewer);
    const distribution = distributionOf(budget);

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
        distribution,
        planBlocker: planBlockerOf(budget, actor, member.memberId),
        receiptBlocker: receiptBlockerOf(budget, actor, member.memberId),
        closeBlocker: closeBlockerOf(budget, actor, distribution),
    };
}
