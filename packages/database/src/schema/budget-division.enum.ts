import { pgEnum } from 'drizzle-orm/pg-core';

import { budgetDivisionTypeOptions } from '@family-budget/domain/family';

export const budgetDivisionType = pgEnum('budget_division_type', budgetDivisionTypeOptions);
