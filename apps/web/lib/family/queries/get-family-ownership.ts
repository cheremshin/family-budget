import { db } from '@family-budget/database';

export async function getFamilyOwnership(familyId: string) {
    return await db.query.families.findFirst({
        columns: {
            id: true,
            ownerId: true,
        },
        where: {
            id: { eq: familyId },
        },
    });
}
