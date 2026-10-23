import { Executor, db } from '@family-budget/database';

export async function getFamily(id: string, tx: Executor = db) {
    return await tx.query.families.findFirst({
        where: {
            id: { eq: id },
        },
        with: {
            settings: {
                columns: {
                    budgetDivisionType: true,
                    personalRemainderPolicy: true,
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
