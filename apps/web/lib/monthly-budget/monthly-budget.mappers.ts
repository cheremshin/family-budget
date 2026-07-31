import {
    IncomePersist,
    MonthlyBudgetItemPersist,
    PlannedIncomePersist,
} from '@family-budget/database';
import {
    Income,
    MonthlyBudget,
    MonthlyBudgetItem,
    PlannedIncome,
} from '@family-budget/domain/monthly-budget';

import { MonthlyBudgetWithRelations, PlannedIncomeWithIncomes } from './types';

export function mapToMonthlyBudget(budget: MonthlyBudgetWithRelations): MonthlyBudget {
    return {
        id: budget.id,
        period: budget.period,
        isClosed: budget.isClosed,
        version: budget.version,
        items: budget.items.map(mapToMonthlyBudgetItem),
        plannedIncomes: budget.plannedIncomes.map(mapToPlannedIncome),
    };
}

export function withUpsertedPlannedIncome(
    budget: MonthlyBudget,
    plannedIncomeRow: PlannedIncomePersist,
): MonthlyBudget {
    const plannedIncome = mapToPlannedIncome({ ...plannedIncomeRow, incomes: [] });
    const index = budget.plannedIncomes.findIndex((pi) => pi.memberId === plannedIncome.memberId);

    const plannedIncomes =
        index === -1
            ? [...budget.plannedIncomes, plannedIncome]
            : budget.plannedIncomes.map((pi, i) => (i === index ? plannedIncome : pi));

    return { ...budget, plannedIncomes };
}

export function withUpsertedIncome(budget: MonthlyBudget, incomeRow: IncomePersist): MonthlyBudget {
    const income = mapToIncome(incomeRow);
    return {
        ...budget,
        plannedIncomes: budget.plannedIncomes.map((plannedIncome) =>
            plannedIncome.id === incomeRow.plannedIncomesId
                ? {
                      ...plannedIncome,
                      incomeReceipts: [...plannedIncome.incomeReceipts, income],
                  }
                : plannedIncome,
        ),
    };
}

export function mapToMonthlyBudgetItem(item: MonthlyBudgetItemPersist): MonthlyBudgetItem {
    return {
        id: item.id,
        budgetId: item.budgetCategoryId,
        calculationMode: item.calculationMode,
        targetAmount: item.targetAmount,
        sortOrder: item.sortOrder,
    };
}

export function mapToPlannedIncome(plannedIncome: PlannedIncomeWithIncomes): PlannedIncome {
    return {
        id: plannedIncome.id,
        memberId: plannedIncome.userId,
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
