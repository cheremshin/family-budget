import { calculationModeOptions } from '@family-budget/domain/budget-category';
import { pgEnum } from 'drizzle-orm/pg-core';

export const calculationMode = pgEnum('calculation_mode', calculationModeOptions);
