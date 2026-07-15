import { db } from '@family-budget/database';

export async function getBudgetCategory(id: string) {
    return await db.query.budgetCategories.findFirst({
        where: {
            id: { eq: id },
            archived: false,
        },
    });
}
