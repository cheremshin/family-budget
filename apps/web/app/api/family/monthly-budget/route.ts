import z from 'zod';

import { periodSchema } from '@family-budget/domain/shared';

import { familyRoute } from '@/client/request-context';
import { monthlyBudgetService } from '@/lib/monthly-budget';

export const GET = familyRoute(
    z.object({ period: periodSchema }),
    async ({ ctx, input }) =>
        (await monthlyBudgetService.getMonthlyBudget(ctx.family.id, input.period)) ?? null,
);
