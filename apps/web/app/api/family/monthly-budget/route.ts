import { familyRoute } from '@/client/request-context';
import { monthlyBudgetService } from '@/lib/monthly-budget';
import { periodSchema } from '@family-budget/domain/shared';
import z from 'zod';

export const GET = familyRoute(z.object({ period: periodSchema }), async ({ ctx, input }) =>
    (await monthlyBudgetService.getMonthlyBudget(ctx.family.id, input.period)) ?? null,
);
