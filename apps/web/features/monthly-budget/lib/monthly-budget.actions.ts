'use server';

import z from 'zod';

import { addIncomeSchema, addPlannedIncomeSchema } from '@family-budget/domain/monthly-budget';
import { periodSchema } from '@family-budget/domain/shared';

import { monthlyBudgetService } from '@/lib/monthly-budget';
import { familyActionClient } from '@/lib/request-context';

export const getMonthlyBudgetAction = familyActionClient
    .inputSchema(z.object({ period: periodSchema }))
    .action(async ({ ctx, parsedInput }) => {
        return await monthlyBudgetService.getMonthlyBudget(ctx.family.id, parsedInput.period);
    });

export const setPlannedIncomeAction = familyActionClient
    .inputSchema(addPlannedIncomeSchema)
    .action(async ({ ctx, parsedInput }) => {
        return await monthlyBudgetService.setPlannedIncome(ctx.user.id, parsedInput);
    });

export const addIncomeAction = familyActionClient
    .inputSchema(addIncomeSchema)
    .action(async ({ ctx, parsedInput }) => {
        return await monthlyBudgetService.addActualIncome(ctx.user.id, parsedInput);
    });
