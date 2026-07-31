import { pgEnum } from 'drizzle-orm/pg-core';

import { calculationModeOptions } from '@family-budget/domain/budget-category';

export const calculationMode = pgEnum('calculation_mode', calculationModeOptions);
