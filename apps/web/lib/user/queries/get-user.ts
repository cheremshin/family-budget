import { Executor, db } from '@family-budget/database';

export async function getUser(id: string, tx: Executor = db) {
    return await tx.query.users.findFirst({
        where: {
            id: { eq: id },
        },
    });
}
