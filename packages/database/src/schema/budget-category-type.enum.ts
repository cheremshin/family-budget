import { pgEnum } from 'drizzle-orm/pg-core';
import { budgetCategoryTypeOptions } from '@family-budget/domain/budget-category';

export const budgetCategoryType = pgEnum('budget_category_type', budgetCategoryTypeOptions);
