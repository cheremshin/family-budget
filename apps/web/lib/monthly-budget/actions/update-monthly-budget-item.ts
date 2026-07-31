import {
    Executor,
    MonthlyBudgetItemPersist,
    UpdateMonthlyBudgetItem,
    db,
    eq,
    schema,
} from '@family-budget/database';

export async function updateMonthlyBudgetItem(
    itemId: string,
    data: UpdateMonthlyBudgetItem,
    tx: Executor = db,
): Promise<MonthlyBudgetItemPersist> {
    const [row] = await tx
        .update(schema.monthlyBudgetItems)
        .set(data)
        .where(eq(schema.monthlyBudgetItems.id, itemId))
        .returning();

    return row;
}
