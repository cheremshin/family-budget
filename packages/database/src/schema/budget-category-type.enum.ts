import { pgEnum } from 'drizzle-orm/pg-core';

export const budgetCategoryType = pgEnum('budget_category_type', [
    'expense',
    'savings',
]);
