import { type PlanBlocker, planBlockerMessage } from '@family-budget/domain/monthly-budget';
import { sumMoney, toKopecks } from '@family-budget/domain/shared';

import { formatMoney } from '@/lib/i18n';

import type { BudgetSnapshot } from '../../model/budget.snapshot';

export type PlanLockView = {
    reason: PlanBlocker;
    message: string;
} | null;

export type PlannedIncomeSummary = {
    plannedAmount: string;
    /** Необходим как дефолтное значение формы редактирования плана */
    plannedAmountValue: string;
    received: string;
    progress: number;
    progressLabel: string;
};

export type PlannedIncomeView = {
    lock: PlanLockView;
} & (
    { status: 'no-plan'; memberName: string } | { status: 'planned'; summary: PlannedIncomeSummary }
);

export function planLockView(blocker: PlanBlocker | null): PlanLockView {
    return blocker && { reason: blocker, message: planBlockerMessage(blocker) };
}

export function buildPlannedIncomeView(s: BudgetSnapshot): PlannedIncomeView {
    const lock = planLockView(s.planBlocker);
    const { member } = s;

    if (member.plannedAmount === null) {
        return { status: 'no-plan', memberName: member.memberName, lock };
    }

    const received = sumMoney(member.incomeReceipts.map((receipt) => receipt.amount));
    const planned = toKopecks(member.plannedAmount);
    const percent = planned === 0 ? null : Math.round((toKopecks(received) / planned) * 100);

    return {
        status: 'planned',
        lock,
        summary: {
            plannedAmount: formatMoney(member.plannedAmount),
            plannedAmountValue: member.plannedAmount,
            received: formatMoney(received),
            progress: percent === null ? 0 : Math.min(percent, 100),
            progressLabel: percent === null ? '-' : `${percent}%`,
        },
    };
}
