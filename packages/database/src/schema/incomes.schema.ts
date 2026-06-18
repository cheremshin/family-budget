import {
    check,
    decimal,
    foreignKey,
    pgTable,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';
import { plannedIncomes } from './planned-incomes.schema';
import { sql } from 'drizzle-orm';

export const incomes = pgTable(
    'incomes',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        plannedIncomesId: uuid('planned_incomes_id').notNull(),
        amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
        receivedAt: timestamp('received_at', { mode: 'date' })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        foreignKey({
            name: 'planned_incomes_income',
            columns: [table.plannedIncomesId],
            foreignColumns: [plannedIncomes.id],
        }),

        check('incomes__amount_non_negative_check', sql`${table.amount} >= 0`),
        check(
            'incomes__received_at_non_in_future_check',
            sql`${table.receivedAt} <= CURRENT_TIMESTAMP`,
        ),
    ],
);
