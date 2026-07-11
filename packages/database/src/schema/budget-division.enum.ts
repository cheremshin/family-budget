import { pgEnum } from 'drizzle-orm/pg-core';

export const budgetDivisionType = pgEnum('budget_division_type', [
    'in_half',
    'in_proportion',
]);
