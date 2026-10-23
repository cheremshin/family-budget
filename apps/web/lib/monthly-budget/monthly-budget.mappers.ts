import { IncomePersist, MonthlyBudgetItemPersist } from '@family-budget/database';
import { BudgetCategory } from '@family-budget/domain/budget-category';
import {
    BudgetDivisionType,
    Family,
    FamilyMember,
    PersonalRemainderPolicy,
} from '@family-budget/domain/family';
import {
    ClosedMonthlyBudget,
    Income,
    MemberIncome,
    MonthlyBudgetItem,
    OpenMonthlyBudget,
    monthlyBudgetSchema,
} from '@family-budget/domain/monthly-budget';
import { assertContract } from '@family-budget/domain/shared';

import { MonthlyBudgetWithRelations, PlannedIncomeWithRelations } from './types';

export function mapToOpenMonthlyBudget(
    budget: MonthlyBudgetWithRelations,
    family: Family,
    categories: BudgetCategory[],
): OpenMonthlyBudget {
    return assertContract(
        monthlyBudgetSchema,
        {
            ...mapToBase(
                budget,
                family.settings.budgetDivisionType,
                family.settings.personalRemainderPolicy,
            ),
            items: categories.map(mapCategoryToItem),
            isClosed: false as const,
            memberIncomes: mirrorMembers(family.members, budget),
        },
        'mapToOpenMonthlyBudget',
    ) as OpenMonthlyBudget;
}

export function mapToClosedMonthlyBudget(budget: MonthlyBudgetWithRelations): ClosedMonthlyBudget {
    if (budget.personalRemainderPolicy === null || budget.remainders.length === 0) {
        throw new Error(`[mapToClosedMonthlyBudget] у закрытого месяца ${budget.id} нет итога`);
    }

    return assertContract(
        monthlyBudgetSchema,
        {
            ...mapToBase(budget, budget.budgetDivisionType!, budget.personalRemainderPolicy),
            items: budget.items.map(mapToMonthlyBudgetItem),
            isClosed: true as const,
            memberIncomes: budget.plannedIncomes.map(mapToClosedMemberIncome),
            contributions: budget.contributions.map((contribution) => ({
                memberId: contribution.memberId,
                categoryId: contribution.categoryId,
                amount: contribution.amount,
            })),
            remainders: budget.remainders.map((remainder) => ({
                memberId: remainder.memberId,
                ownRemainder: remainder.ownRemainder,
                personalAmount: remainder.personalAmount,
                settlementAmount: remainder.settlementAmount,
            })),
        },
        'mapToClosedMonthlyBudget',
    ) as ClosedMonthlyBudget;
}

function mapToBase(
    budget: MonthlyBudgetWithRelations,
    divisionType: BudgetDivisionType,
    personalRemainderPolicy: PersonalRemainderPolicy,
) {
    return {
        id: budget.id,
        period: budget.period,
        version: budget.version,
        divisionType,
        personalRemainderPolicy: personalRemainderPolicy,
    };
}

function mapCategoryToItem(category: BudgetCategory): MonthlyBudgetItem {
    return {
        categoryId: category.id,
        categoryName: category.name,
        categoryType: category.type,
        calculationMode: category.calculationMode,
        targetAmount: category.targetAmount,
        sortOrder: category.sortOrder,
    };
}

function mapToMonthlyBudgetItem(item: MonthlyBudgetItemPersist): MonthlyBudgetItem {
    return {
        categoryId: item.budgetCategoryId,
        categoryName: item.categoryName,
        categoryType: item.categoryType,
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

function mapToIncome(income: IncomePersist): Income {
    return {
        id: income.id,
        amount: income.amount,
        receivedAt: income.receivedAt,
    };
}
