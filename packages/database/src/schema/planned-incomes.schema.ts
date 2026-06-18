import {
    check,
    date,
    decimal,
    foreignKey,
    pgTable,
    uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { sql } from 'drizzle-orm';

export const plannedIncomes = pgTable(
    'planned_incomes',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id').notNull(),
        amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
        period: date('period').notNull(),
    },
    (table) => [
        foreignKey({
            name: 'user_planned_incomes',
            columns: [table.userId],
            foreignColumns: [users.id],
        }),

        check(
            'planned_incomes__amount_non_negative_check',
            sql`${table.amount} >= 0`,
        ),
    ],
);
