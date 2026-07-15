import { db } from '@family-budget/database';

export async function getUserByUsername(username: string) {
    return await db.query.users.findFirst({
        where: {
            username: { eq: username },
        },
    });
}
