import { toKopecks } from '@family-budget/domain/shared';

import { formatMoney } from '@/lib/i18n';

import type { BudgetSnapshot } from '../../model/budget.snapshot';

export type MemberView = {
    id: string;
    name: string;
    plannedIncome: string | null;
    plannedIncomeWeight: string | null;
    isSelected: boolean;
};

export type MemberSelectView = {
    members: MemberView[];
};

export function buildMemberSelectView(s: BudgetSnapshot): MemberSelectView {
    const incomes = s.budget.memberIncomes;
    const total = incomes.reduce(
        (acc, member) =>
            member.plannedAmount === null ? acc : acc + toKopecks(member.plannedAmount),
        0,
    );

    return {
        members: incomes.map((member) => ({
            id: member.memberId,
            name: member.memberName,
            isSelected: member.memberId === s.member.memberId,
            plannedIncome: member.plannedAmount === null ? null : formatMoney(member.plannedAmount),
            plannedIncomeWeight:
                member.plannedAmount === null || total === 0
                    ? null
                    : `${((toKopecks(member.plannedAmount) / total) * 100).toFixed(1)}%`,
        })),
    };
}
