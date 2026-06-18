import {
    boolean,
    check,
    date,
    decimal,
    foreignKey,
    pgTable,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';
import { families } from './families.schema';
import { sql } from 'drizzle-orm';

export const monthlyBudget = pgTable(
    'monthly_budget',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        familyId: uuid('family_id').notNull(),
        period: date('period').notNull(),
        savingsRate: decimal('savings_rate', { precision: 5, scale: 2 })
            .notNull()
            .default('5.0'),
        isClosed: boolean('is_closed').notNull().default(false),
        amount: decimal('amount', { precision: 10, scale: 2 }),
    },
    (table) => [
        foreignKey({
            name: 'family_monthly_budget',
            columns: [table.familyId],
            foreignColumns: [families.id],
        }),

        uniqueIndex('monthly__budget_family_period_unique_index').on(
            table.familyId,
            table.period,
        ),

        check(
            'monthly__budget_savings_rate_non_negative_check',
            sql`${table.savingsRate} >= 0`,
        ),
        check(
            'monthly__budget_amount_non_negative_check',
            sql`${table.amount} >= 0`,
        ),
    ],
);
