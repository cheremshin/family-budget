import { sql } from 'drizzle-orm';
import {
    PgTableExtraConfigValue,
    check,
    decimal,
    foreignKey,
    index,
    pgTable,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

import { monthlyBudgets } from './monthly-budgets.schema';
import { users } from './users.schema';

const TABLE_NAME = 'planned_incomes';

export const plannedIncomes = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        monthlyBudgetId: uuid('monthly_budget_id').notNull(),
        userId: uuid('user_id').notNull(),

        plannedAmount: decimal('planned_amount', {
            precision: 12,
            scale: 2,
        }).notNull(),
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__monthly_budget_id_fk`,
            columns: [table.monthlyBudgetId],
            foreignColumns: [monthlyBudgets.id],
        }).onDelete('cascade'),

        foreignKey({
            name: `${TABLE_NAME}_user_id_fk`,
            columns: [table.userId],
            foreignColumns: [users.id],
        }).onDelete('restrict'),

        uniqueIndex(`${TABLE_NAME}__single_user_monthly_plan`).on(
            table.monthlyBudgetId,
            table.userId,
        ),
        index(`${TABLE_NAME}__monthly_budget_index`).on(table.monthlyBudgetId),
        index(`${TABLE_NAME}__user_index`).on(table.userId),

        check(`${TABLE_NAME}__planned_amount_non_negative_check`, sql`${table.plannedAmount} >= 0`),
    ],
);
