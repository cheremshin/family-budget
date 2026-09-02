import {
    Executor,
    NewPlannedIncome,
    PlannedIncomePersist,
    db,
    schema,
} from '@family-budget/database';

export async function upsertPlannedIncome(
    data: NewPlannedIncome,
    tx: Executor = db,
): Promise<PlannedIncomePersist> {
    const [row] = await tx
        .insert(schema.plannedIncomes)
        .values(data)
        .onConflictDoUpdate({
            target: [schema.plannedIncomes.monthlyBudgetId, schema.plannedIncomes.userId],
            set: { plannedAmount: data.plannedAmount },
        })
        .returning();

    return row;
}
