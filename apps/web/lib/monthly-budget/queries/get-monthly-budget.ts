import { Executor, db } from '@family-budget/database';
import { Period } from '@family-budget/domain/shared';

import { MonthlyBudgetWithRelations } from '../types';

/**
 * Читает агрегат целиком. Порядок вложенных коллекций задаётся здесь, а не в маппере:
 * маппер обязан оставаться чистым преобразованием формы, а сортировка — дело запроса.
 */
export async function getMonthlyBudget(
    familyId: string,
    period: Period,
    tx: Executor = db,
): Promise<MonthlyBudgetWithRelations | undefined> {
    return await tx.query.monthlyBudgets.findFirst({
        where: {
            familyId: { eq: familyId },
            period: { eq: period },
        },
        with: {
            items: {
                orderBy: { sortOrder: 'asc', id: 'asc' },
            },
            plannedIncomes: {
                orderBy: { userId: 'asc' },
                with: {
                    user: true,
                    incomes: {
                        orderBy: { receivedAt: 'asc', id: 'asc' },
                    },
                },
            },
            contributions: {
                orderBy: { memberId: 'asc', categoryId: 'asc' },
            },
            remainders: {
                orderBy: { memberId: 'asc' },
            },
        },
    });
}
