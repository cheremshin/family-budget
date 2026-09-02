import {
    Executor,
    MonthlyBudgetPersist,
    NewMonthlyBudget,
    db,
    schema,
} from '@family-budget/database';

export async function insertMonthlyBudgetIfMissing(
    data: NewMonthlyBudget,
    tx: Executor = db,
): Promise<MonthlyBudgetPersist> {
    const [row] = await tx
        .insert(schema.monthlyBudgets)
        .values(data)
        .onConflictDoNothing({
            target: [schema.monthlyBudgets.familyId, schema.monthlyBudgets.period],
        })
        .returning();

    return row;
}
