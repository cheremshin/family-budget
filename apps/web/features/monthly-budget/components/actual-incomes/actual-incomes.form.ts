import z from 'zod';

import { incomeFieldsSchema } from '@family-budget/domain/monthly-budget';

export type IncomeReceiptFormValues = z.infer<typeof incomeFieldsSchema>;
