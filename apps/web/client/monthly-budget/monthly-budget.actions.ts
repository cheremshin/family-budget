'use server';

import z from 'zod';

import { addIncomeSchema, addPlannedIncomeSchema, closeMonthlyBudgetSchema } from '@family-budget/domain/monthly-budget';
import { periodSchema } from '@family-budget/domain/shared';

import { monthlyBudgetService } from '@/lib/monthly-budget';

import { familyActionClient } from '../request-context';

export const createMonthlyBudget = familyActionClient
    .inputSchema(z.object({ period: periodSchema }))
    .action(async ({ ctx, parsedInput }) =>
        monthlyBudgetService.createMonthlyBudget({
            familyId: ctx.family.id,
            period: parsedInput.period,
        }),
    );

export const setPlannedIncomeAction = familyActionClient
    .inputSchema(addPlannedIncomeSchema)
    .action(async ({ ctx, parsedInput }) =>
        monthlyBudgetService.setPlannedIncome(ctx.user.id, parsedInput),
    );

export const addIncomeAction = familyActionClient
    .inputSchema(addIncomeSchema)
    .action(async ({ ctx, parsedInput }) =>
        monthlyBudgetService.addActualIncome(ctx.user.id, parsedInput),
    );

export const closeMonth = familyActionClient
    .inputSchema(closeMonthlyBudgetSchema)
    .action(async ({ ctx, parsedInput }) =>
        monthlyBudgetService.closeMonthlyBudget(ctx.user.id, parsedInput),
    );
