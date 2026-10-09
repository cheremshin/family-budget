import { Executor, db } from '@family-budget/database';

type CategoriesQueryOptions = {
    archived: boolean;
};

export async function getFamilyBudgetCategories(
    familyId: string,
    options: CategoriesQueryOptions = { archived: false },
    tx: Executor = db,
) {
    return await tx.query.budgetCategories.findMany({
        where: {
            familyId: { eq: familyId },
            archived: options.archived,
        },
        orderBy: {
            sortOrder: 'asc',
            id: 'asc',
        },
    });
}
