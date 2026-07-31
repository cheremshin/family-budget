import { monthlyBudgetService, toMonthStart } from '@/lib/monthly-budget';

export async function getInitialBudgetData(familyId: string) {
    const period = toMonthStart(new Date());
    const monthlyBudget = await monthlyBudgetService.ensureMonthlyBudget({
        familyId,
        period,
    });
    return { monthlyBudget };
}
