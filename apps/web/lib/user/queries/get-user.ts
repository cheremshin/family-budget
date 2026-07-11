import { db } from '@family-budget/database/connection';

export async function getUser(id: string) {
    return await db.query.users.findFirst({
        where: {
            id: { eq: id },
        },
    });
}
