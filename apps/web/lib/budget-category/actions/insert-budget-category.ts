import {
    db,
    BudgetCategoryPersist,
    Executor,
    NewBudgetCategory,
    schema,
} from '@family-budget/database';

export async function insertBudgetCategory(
    data: NewBudgetCategory,
    tx: Executor = db,
): Promise<BudgetCategoryPersist> {
    const [row] = await tx.insert(schema.budgetCategories).values(data).returning();
    return row;
}

export async function insertBudgetCategories(
    data: NewBudgetCategory[],
    tx: Executor = db,
): Promise<BudgetCategoryPersist[]> {
    return await tx.insert(schema.budgetCategories).values(data).returning();
}
