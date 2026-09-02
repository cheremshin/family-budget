import { Executor, PlannedIncomePersist, db } from '@family-budget/database';

export async function getPlannedIncome(
    monthlyBudgetId: string,
    userId: string,
    tx: Executor = db,
): Promise<PlannedIncomePersist | undefined> {
    return await tx.query.plannedIncomes.findFirst({
        where: {
            monthlyBudgetId: { eq: monthlyBudgetId },
            userId: { eq: userId },
        },
    });
}
