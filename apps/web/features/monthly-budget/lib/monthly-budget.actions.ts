'use server';

import { MonthlyBudget } from '@family-budget/domain/monthly-budget';

import {
    getMonthlyBudget as getMonthlyBudgetQuery,
    mapToMonthlyBudget,
    monthlyBudgetService,
} from '@/lib/monthly-budget';
import { requireFamily, requireUser } from '@/lib/request-context';

export async function getMonthlyBudget(period: string): Promise<MonthlyBudget | undefined> {
    const { id: familyId } = await requireFamily();
    const budget = await getMonthlyBudgetQuery(familyId, period);
    return budget ? mapToMonthlyBudget(budget) : undefined;
}

export async function setPlannedIncome(input: {
    plannedAmount: string;
    period: Date;
}): Promise<MonthlyBudget> {
    const { id: userId } = await requireUser();
    await requireFamily();
    return await monthlyBudgetService.setPlannedIncome(userId, input);
}

export async function addIncome(input: { amount: string; receivedAt: Date; period: Date }) {
    const { id: userId } = await requireUser();
    await requireFamily();
    return await monthlyBudgetService.addActualIncome(userId, input);
}
