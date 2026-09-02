import {
    BudgetCategoryPersist,
    Executor,
    UpdateBudgetCategory,
    db,
    eq,
    schema,
} from '@family-budget/database';

export async function updateBudgetCategory(
    id: string,
    data: UpdateBudgetCategory,
    tx: Executor = db,
): Promise<BudgetCategoryPersist> {
    const [row] = await tx
        .update(schema.budgetCategories)
        .set(data)
        .where(eq(schema.budgetCategories.id, id))
        .returning();

    return row;
}
