import { Executor, IncomePersist, NewIncome, db, schema } from '@family-budget/database';

export async function insertIncome(data: NewIncome, tx: Executor = db): Promise<IncomePersist> {
    const [row] = await tx.insert(schema.incomes).values(data).returning();
    return row;
}
