import {
    Executor,
    MonthlyBudgetPersist,
    UpdateMonthlyBudget,
    db,
    eq,
    schema,
} from '@family-budget/database';

export async function updateMonthlyBudget(
    budgetId: string,
    data: UpdateMonthlyBudget,
    tx: Executor = db,
): Promise<MonthlyBudgetPersist> {
    const [row] = await tx
        .update(schema.monthlyBudgets)
        .set(data)
        .where(eq(schema.monthlyBudgets.id, budgetId))
        .returning();

    return row;
}
