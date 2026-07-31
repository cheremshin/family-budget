import { Executor, db, eq, schema } from '@family-budget/database';

export async function setFamily(data: { userId: string; familyId: string }, tx: Executor = db) {
    const [row] = await tx
        .update(schema.users)
        .set({ familyId: data.familyId })
        .where(eq(schema.users.id, data.userId))
        .returning();

    return row;
}
