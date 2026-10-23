import { sql } from 'drizzle-orm';
import {
    PgTableExtraConfigValue,
    check,
    decimal,
    foreignKey,
    pgTable,
    primaryKey,
    uuid,
} from 'drizzle-orm/pg-core';

import { budgetCategories } from './budget-categories.schema';
import { monthlyBudgets } from './monthly-budgets.schema';
import { users } from './users.schema';

const TABLE_NAME = 'monthly_budget_contributions';

export const monthlyBudgetContributions = pgTable(
    TABLE_NAME,
    {
        monthlyBudgetId: uuid('monthly_budget_id').notNull(),
        memberId: uuid('member_id').notNull(),
        categoryId: uuid('category_id').notNull(),
        amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    },
    (table): PgTableExtraConfigValue[] => [
        primaryKey({
            name: `${TABLE_NAME}__pk`,
            columns: [table.monthlyBudgetId, table.memberId, table.categoryId],
        }),

        foreignKey({
            name: `${TABLE_NAME}__monthly_budget_id_fk`,
            columns: [table.monthlyBudgetId],
            foreignColumns: [monthlyBudgets.id],
        }).onDelete('cascade'),

        foreignKey({
            name: `${TABLE_NAME}__member_id_fk`,
            columns: [table.memberId],
            foreignColumns: [users.id],
        }).onDelete('no action'),

        foreignKey({
            name: `${TABLE_NAME}__category_id_fk`,
            columns: [table.categoryId],
            foreignColumns: [budgetCategories.id],
        }).onDelete('no action'),

        check(`${TABLE_NAME}__amount_non_negative_check`, sql`${table.amount} >= 0`),
    ],
);
