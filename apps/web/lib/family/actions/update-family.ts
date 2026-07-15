import { db, eq, Executor, FamilyPersist, schema, UpdateFamily } from '@family-budget/database';

export async function updateFamily(
    id: string,
    data: UpdateFamily,
    tx: Executor = db,
): Promise<FamilyPersist> {
    const [row] = await tx
        .update(schema.families)
        .set(data)
        .where(eq(schema.families.id, id))
        .returning();

    return row;
}
