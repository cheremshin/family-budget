import z from 'zod';

import { periodSchema } from '../shared';

export const monthlyBudgetChangedEventSchema = z.object({
    id: z.string(),
    type: z.literal('monthly-budget.changed'),
    occurredAt: z.iso.datetime(),
    monthlyBudgetId: z.uuid(),
    familyId: z.uuid(),
    period: periodSchema,
    version: z.int(),
});

export type MonthlyBudgetChangedEvent = z.infer<typeof monthlyBudgetChangedEventSchema>;
