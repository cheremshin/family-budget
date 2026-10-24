import type { Actor } from '../family';
import type { DistributionResult } from './monthly-budget.calculation';
import type { MemberIncome, MonthlyBudget } from './monthly-budget.contract';

/**
 * Файл реализует правила работы с бюджетом описанные в docs/domain/rules.md
 */

export const closeBlockerOptions = [
    'not-owner',
    'closed',
    'plan-incomplete',
    'no-categories',
    'over-allocated',
] as const;

export type CloseBlocker = (typeof closeBlockerOptions)[number];

export type PlanBlocker = 'closed' | 'foreign';
export type ReceiptBlocker = 'no-plan' | 'foreign';

/** Почему нельзя закрыть месяц */
export function closeBlockerOf(
    budget: MonthlyBudget,
    actor: Actor,
    distribution: DistributionResult | undefined,
): CloseBlocker | null {
    if (budget.isClosed) return 'closed';
    if (!actor.isOwner) return 'not-owner';

    const members: MemberIncome[] = budget.memberIncomes;
    if (members.some((member) => member.plannedAmount === null)) return 'plan-incomplete';
    if (budget.items.length === 0) return 'no-categories';

    return distribution?.isOverAllocated ? 'over-allocated' : null;
}

/** Почему нельзя менять план участника `memberId` */
export function planBlockerOf(
    budget: MonthlyBudget,
    actor: Actor,
    memberId: string,
): PlanBlocker | null {
    if (budget.isClosed) return 'closed';
    return memberId === actor.memberId ? null : 'foreign';
}

/** Почему нельзя писать поступление участнику `memberId` */
export function receiptBlockerOf(
    budget: MonthlyBudget,
    actor: Actor,
    memberId: string,
): ReceiptBlocker | null {
    const members: MemberIncome[] = budget.memberIncomes;
    const member = members.find((item) => item.memberId === memberId);
    if (member?.plannedAmount == null) return 'no-plan';

    return memberId === actor.memberId ? null : 'foreign';
}
