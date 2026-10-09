import z from 'zod';

import { plannedIncomeFieldsSchema } from '@family-budget/domain/monthly-budget';

export type PlannedIncomeFormValues = z.infer<typeof plannedIncomeFieldsSchema>;
