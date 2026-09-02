import { cache } from 'react';

import { toPeriod } from '@family-budget/domain/shared';

import { monthlyBudgetService } from '@/lib/monthly-budget';
import { requireFamily, requireUser } from '@/lib/request-context';

export const loadBudgetData = cache(async () => {
    const { id: userId } = await requireUser();
    const family = await requireFamily();
    const budget = await monthlyBudgetService.ensureMonthlyBudget({
        familyId: family.id,
        period: toPeriod(new Date()),
    });
    return {
        userId,
        familyId: family.id,
        monthlyBudget: budget,
    };
});
