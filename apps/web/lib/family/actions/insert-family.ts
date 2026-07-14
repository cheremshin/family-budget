import { db } from '@family-budget/database/connection';
import { Executor, FamilyPersist, NewFamily, schema } from '@family-budget/database';

export async function insertFamily(data: NewFamily, tx: Executor = db): Promise<FamilyPersist> {
    const [row] = await tx.insert(schema.families).values(data).returning();
    return row;
}
