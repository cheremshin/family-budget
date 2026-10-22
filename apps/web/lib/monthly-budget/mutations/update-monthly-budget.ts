import {
    Executor,
    MonthlyBudgetPersist,
    UpdateMonthlyBudget,
    db,
    eq,
    schema,
    sql,
} from '@family-budget/database';

export async function updateMonthlyBudget(
    budgetId: string,
    data: Omit<UpdateMonthlyBudget, 'version'>,
    tx: Executor = db,
): Promise<MonthlyBudgetPersist> {
    const [row] = await tx
        .update(schema.monthlyBudgets)
        .set({ ...data, version: sql`${schema.monthlyBudgets.version} + 1` })
        .where(eq(schema.monthlyBudgets.id, budgetId))
        .returning();

    return row;
}
