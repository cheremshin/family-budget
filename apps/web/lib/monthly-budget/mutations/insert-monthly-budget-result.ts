import { Executor, db, schema } from '@family-budget/database';
import type { DistributionResult } from '@family-budget/domain/monthly-budget';

export async function insertMonthlyBudgetResult(
    monthlyBudgetId: string,
    { contributions, remainders }: DistributionResult,
    memberNames: Map<string, string>,
    tx: Executor = db,
): Promise<void> {
    if (contributions.length > 0) {
        await tx.insert(schema.monthlyBudgetContributions).values(
            contributions.map((contribution) => ({
                monthlyBudgetId,
                memberId: contribution.memberId,
                categoryId: contribution.categoryId,
                amount: contribution.amount,
            })),
        );
    }

    await tx.insert(schema.monthlyBudgetRemainders).values(
        remainders.map((remainder) => ({
            monthlyBudgetId,
            memberId: remainder.memberId,
            memberName: memberNames.get(remainder.memberId)!,
            ownRemainder: remainder.ownRemainder,
            personalAmount: remainder.personalAmount,
            settlementAmount: remainder.settlementAmount,
        })),
    );
}
