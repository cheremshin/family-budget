import { Executor, db } from '@family-budget/database';

export async function getFamilyMembers(familyId: string, tx: Executor = db) {
    return await tx.query.users.findMany({
        columns: {
            id: true,
            username: true,
        },
        where: {
            familyId: { eq: familyId },
        },
    });
}
