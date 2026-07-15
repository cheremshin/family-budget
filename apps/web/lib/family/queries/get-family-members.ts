import { db } from '@family-budget/database';

export async function getFamilyMembers(familyId: string) {
    return await db.query.users.findMany({
        columns: {
            id: true,
            username: true,
        },
        where: {
            familyId: { eq: familyId },
        },
    });
}
