import z from 'zod';

import { moneySchema } from '../shared';

export const monthlyBudgetFieldsSchema = z.object({
    period: z.date(),
});

export const plannedIncomeFieldsSchema = z.object({
    plannedAmount: moneySchema,
});

export const incomeFieldsSchema = z.object({
    amount: moneySchema,
    receivedAt: z.date(),
});

export const createMonthlyBudgetSchema = monthlyBudgetFieldsSchema;
export const addPlannedIncomeSchema = plannedIncomeFieldsSchema.extend(
    monthlyBudgetFieldsSchema.shape,
);
export const addIncomeSchema = incomeFieldsSchema.extend(monthlyBudgetFieldsSchema.shape);

export type CreateMonthlyBudgetInput = z.infer<typeof createMonthlyBudgetSchema>;
export type AddPlannedIncomeInput = z.infer<typeof addPlannedIncomeSchema>;
export type AddIncomeInput = z.infer<typeof addIncomeSchema>;
