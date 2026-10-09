import { type MonthlyBudget, monthlyBudgetSchema } from '@family-budget/domain/monthly-budget';
import { type Period, assertContract } from '@family-budget/domain/shared';

import { fetchJson } from '../core';

const BUDGET_URL = '/api/family/monthly-budget';
const budgetOrNull = monthlyBudgetSchema.nullable();

export async function fetchMonthlyBudget(
    period: Period,
    signal?: AbortSignal,
): Promise<MonthlyBudget | null> {
    const budget = await fetchJson<MonthlyBudget | null>(`${BUDGET_URL}?period=${period}`, signal);
    return assertContract(budgetOrNull, budget, `GET ${BUDGET_URL}`);
}
