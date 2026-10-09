import { IncomePersist, MonthlyBudgetItemPersist } from '@family-budget/database';
import { BudgetDivisionType, Family, FamilyMember } from '@family-budget/domain/family';
import {
    ClosedMonthlyBudget,
    Income,
    MemberIncome,
    MonthlyBudgetItem,
    OpenMonthlyBudget,
    distribute,
    monthlyBudgetSchema,
} from '@family-budget/domain/monthly-budget';
import { assertContract } from '@family-budget/domain/shared';

import { PERSONAL_REMAINDER_POLICY } from './configuration/personal-remainder-policy';
import { MonthlyBudgetWithRelations, PlannedIncomeWithRelations } from './types';
import { BudgetCategory } from '@family-budget/domain/budget-category';

export function mapToOpenMonthlyBudget(
    budget: MonthlyBudgetWithRelations,
    family: Family,
    categories: BudgetCategory[],
): OpenMonthlyBudget {
    return assertContract(
        monthlyBudgetSchema,
        {
            ...mapToBase(budget, family.settings.budgetDivisionType),
            items: categories.map(mapCategoryToItem),
            isClosed: false as const,
            memberIncomes: mirrorMembers(family.members, budget),
        },
        'mapToOpenMonthlyBudget',
    ) as OpenMonthlyBudget;
}

export function mapToClosedMonthlyBudget(budget: MonthlyBudgetWithRelations): ClosedMonthlyBudget {
    const divisionType = budget.budgetDivisionType!;

    const memberIncomes = budget.plannedIncomes.map(mapToClosedMemberIncome);
    const items = budget.items.map(mapToMonthlyBudgetItem);

    // Вклады не хранятся: все входы заморожены закрытием, поэтому раскладка —
    // чистая функция от уже сохранённого.
    const { contributions, remainders } = distribute({
        divisionType,
        personalRemainderPolicy: PERSONAL_REMAINDER_POLICY,
        items,
        members: memberIncomes,
    });

    return assertContract(
        monthlyBudgetSchema,
        {
            ...mapToBase(budget, divisionType),
            items,
            isClosed: true as const,
            memberIncomes,
            contributions,
            remainders,
        },
        'mapToClosedMonthlyBudget',
    ) as ClosedMonthlyBudget;
}

function mapToBase(budget: MonthlyBudgetWithRelations, divisionType: BudgetDivisionType) {
    return {
        id: budget.id,
        period: budget.period,
        version: budget.version,
        divisionType,
        personalRemainderPolicy: PERSONAL_REMAINDER_POLICY,
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
