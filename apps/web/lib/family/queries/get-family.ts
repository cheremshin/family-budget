import { db } from '@family-budget/database/connection';

export async function getFamily(id: string) {
    return await db.query.families.findFirst({
        where: {
            id: { eq: id },
        },
        with: {
            settings: {
                columns: {
                    budgetDivisionType: true,
                },
            },
            members: {
                columns: {
                    id: true,
                    username: true,
                },
            },
        },
    });
}
