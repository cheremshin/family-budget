import { sql } from 'drizzle-orm';
import {
    PgTableExtraConfigValue,
    check,
    date,
    decimal,
    foreignKey,
    index,
    pgTable,
    uuid,
} from 'drizzle-orm/pg-core';

import { plannedIncomes } from './planned-incomes.schema';

const TABLE_NAME = 'incomes';

export const incomes = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        plannedIncomesId: uuid('planned_incomes_id').notNull(),

        amount: decimal('amount', {
            precision: 12,
            scale: 2,
        }).notNull(),

        receivedAt: date('received_at').notNull().defaultNow(),
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__planned_income_id_fk`,
            columns: [table.plannedIncomesId],
            foreignColumns: [plannedIncomes.id],
        }).onDelete('cascade'),

        index(`${TABLE_NAME}__planned_incomes_index`).on(table.plannedIncomesId),

        check(`${TABLE_NAME}__amount_non_negative_check`, sql`${table.amount} >= 0`),
        check(
            `${TABLE_NAME}__received_at_not_in_future_check`,
            sql`${table.receivedAt} <= CURRENT_DATE`,
        ),
    ],
);
