import { Executor, db, eq, schema } from '@family-budget/database';

export async function deleteMonthlyBudgetItem(itemId: string, tx: Executor = db): Promise<void> {
    await tx.delete(schema.monthlyBudgetItems).where(eq(schema.monthlyBudgetItems.id, itemId));
}
