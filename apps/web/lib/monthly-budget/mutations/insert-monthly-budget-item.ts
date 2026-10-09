import {
    Executor,
    MonthlyBudgetItemPersist,
    NewMonthlyBudgetItem,
    db,
    schema,
} from '@family-budget/database';

export async function insertMonthlyBudgetItem(
    data: NewMonthlyBudgetItem,
    tx: Executor = db,
): Promise<MonthlyBudgetItemPersist> {
    const [row] = await tx.insert(schema.monthlyBudgetItems).values(data).returning();
    return row;
}

export async function insertMonthlyBudgetItems(
    data: NewMonthlyBudgetItem[],
    tx: Executor = db,
): Promise<MonthlyBudgetItemPersist[]> {
    return await tx
        .insert(schema.monthlyBudgetItems)
        .values(data)
        .returning();
}
