import { Executor, db } from '@family-budget/database';

import { MonthlyBudgetWithRelations } from '../types';

export async function getMonthlyBudget(
    familyId: string,
    period: string,
    tx: Executor = db,
): Promise<MonthlyBudgetWithRelations | undefined> {
    return await tx.query.monthlyBudgets.findFirst({
        where: {
            familyId: { eq: familyId },
            period: { eq: period },
        },
        with: {
            items: true,
            plannedIncomes: {
                with: {
                    incomes: true,
                },
            },
        },
    });
}
