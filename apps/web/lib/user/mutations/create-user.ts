import { Executor, NewUser, UserPersist, db, schema } from '@family-budget/database';

export async function createUser(data: NewUser, tx: Executor = db): Promise<UserPersist> {
    const [row] = await tx.insert(schema.users).values(data).returning();
    return row;
}
