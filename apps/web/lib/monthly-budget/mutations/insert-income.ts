import {
    type Executor,
    type IncomePersist,
    type NewIncome,
    db,
    schema,
} from '@family-budget/database';

export async function insertIncome(
    data: NewIncome,
    tx: Executor = db,
): Promise<IncomePersist | undefined> {
    const [row] = await tx.insert(schema.incomes).values(data).returning();
    return row;
}
