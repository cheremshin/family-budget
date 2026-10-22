import { Executor, MonthlyBudgetPersist, db, eq, schema, sql } from '@family-budget/database';

export async function touchMonthlyBudget(
    budgetId: string,
    tx: Executor = db,
): Promise<MonthlyBudgetPersist> {
    const [row] = await tx
        .update(schema.monthlyBudgets)
        .set({ version: sql`${schema.monthlyBudgets.version} + 1` })
        .where(eq(schema.monthlyBudgets.id, budgetId))
        .returning();

    return row;
}
