import { db } from '@family-budget/database';

export async function getFamilyBudgetCategories(familyId: string) {
    return await db.query.budgetCategories.findMany({
        where: {
            familyId: { eq: familyId },
            archived: false,
        },
        orderBy: {
            sortOrder: 'asc',
        },
    });
}
