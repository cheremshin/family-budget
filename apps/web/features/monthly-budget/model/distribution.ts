import {
    type DistributionResult,
    type MemberIncome,
    type MemberRemainder,
    type MonthlyBudget,
    type ReceiptAllocationResult,
    allocateReceipts,
    distribute,
} from '@family-budget/domain/monthly-budget';
import type { Money } from '@family-budget/domain/shared';

export type PlannedMember = MemberIncome & { plannedAmount: Money };

export function plannedMembersOf(budget: MonthlyBudget): PlannedMember[] {
    const members: MemberIncome[] = budget.memberIncomes;
    return members.filter((member): member is PlannedMember => member.plannedAmount !== null);
}

export function resolveDistribution(budget: MonthlyBudget): DistributionResult | undefined {
    if (budget.isClosed) {
        return { contributions: budget.contributions, remainders: budget.remainders };
    }

    const members = plannedMembersOf(budget).map(({ memberId, plannedAmount }) => ({
        memberId,
        plannedAmount,
    }));
    if (members.length === 0) return undefined;

    return distribute({
        divisionType: budget.divisionType,
        personalRemainderPolicy: budget.personalRemainderPolicy,
        items: budget.items,
        members,
    });
}

export type MemberShare = {
    remainder: MemberRemainder;
    contributions: Array<{ categoryId: string; amount: Money }>;
    allocation: ReceiptAllocationResult;
};

export function memberShareOf(
    distribution: DistributionResult,
    member: MemberIncome,
): MemberShare | undefined {
    const remainder = distribution.remainders.find((item) => item.memberId === member.memberId);
    if (!remainder) return undefined;

    const contributions = distribution.contributions
        .filter((item) => item.memberId === member.memberId)
        .map(({ categoryId, amount }) => ({ categoryId, amount }));

    return {
        remainder,
        contributions,
        allocation: allocateReceipts({ remainder, contributions, receipts: member.incomeReceipts }),
    };
}
