import { budgetDivisionTypeOptions } from '@family-budget/domain/family';
import { pgEnum } from 'drizzle-orm/pg-core';

export const budgetDivisionType = pgEnum('budget_division_type', budgetDivisionTypeOptions);
