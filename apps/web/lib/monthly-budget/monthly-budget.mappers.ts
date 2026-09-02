import { IncomePersist, MonthlyBudgetItemPersist } from '@family-budget/database';
import { FamilyMember } from '@family-budget/domain/family';
import {
    Income,
    MemberIncome,
    MonthlyBudget,
    MonthlyBudgetItem,
    distribute,
    monthlyBudgetSchema,
} from '@family-budget/domain/monthly-budget';
import { assertContract } from '@family-budget/domain/shared';

import { MonthlyBudgetWithRelations, PlannedIncomeWithRelations } from './types';

export function mapToMonthlyBudget(
    budget: MonthlyBudgetWithRelations,
    members: FamilyMember[],
): MonthlyBudget {
    const base = {
        id: budget.id,
        period: budget.period,
        version: budget.version,
        items: budget.items.map(mapToMonthlyBudgetItem),
    };

    if (!budget.isClosed) {
        return assertContract(
            monthlyBudgetSchema,
            { ...base, isClosed: false as const, memberIncomes: mirrorMembers(members, budget) },
            'mapToMonthlyBudget',
        );
    }

    const memberIncomes = budget.plannedIncomes.map(mapToClosedMemberIncome);

    const { contributions, personalRemainders } = distribute({
        divisionType: budget.budgetDivisionType!,
        items: base.items,
        members: memberIncomes,
    });

    return assertContract(
        monthlyBudgetSchema,
        {
            ...base,
            isClosed: true as const,
            memberIncomes,
            contributions,
            personalRemainders,
        },
        'mapToMonthlyBudget',
    );
}

export function mapToMonthlyBudgetItem(item: MonthlyBudgetItemPersist): MonthlyBudgetItem {
    return {
        id: item.id,
        categoryId: item.budgetCategoryId,
        calculationMode: item.calculationMode,
        targetAmount: item.targetAmount,
        sortOrder: item.sortOrder,
    };
}

function mirrorMembers(
    members: FamilyMember[],
    budget: MonthlyBudgetWithRelations,
): MemberIncome[] {
    const byUser = new Map(budget.plannedIncomes.map((income) => [income.userId, income]));

    return members.map((member) => {
        const plannedIncome = byUser.get(member.id);

        return {
            memberId: member.id,
            memberName: member.username,
            plannedAmount: plannedIncome?.plannedAmount ?? null,
            incomeReceipts: plannedIncome?.incomes.map(mapToIncome) ?? [],
        };
    });
}

function mapToClosedMemberIncome(plannedIncome: PlannedIncomeWithRelations) {
    return {
        memberId: plannedIncome.userId,
        memberName: plannedIncome.user.username,
        plannedAmount: plannedIncome.plannedAmount,
        incomeReceipts: plannedIncome.incomes.map(mapToIncome),
    };
}

export function mapToIncome(income: IncomePersist): Income {
    return {
        id: income.id,
        amount: income.amount,
        receivedAt: income.receivedAt,
    };
}
