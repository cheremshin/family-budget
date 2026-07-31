import { sql } from 'drizzle-orm';
import {
    PgTableExtraConfigValue,
    boolean,
    check,
    date,
    foreignKey,
    integer,
    pgTable,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

import { auditColumns } from '../utils/audit-columns';
import { families } from './families.schema';

const TABLE_NAME = 'monthly_budget';

export const monthlyBudgets = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        familyId: uuid('family_id').notNull(),

        period: date('period').notNull(),
        isClosed: boolean('is_closed').notNull().default(false),
        version: integer('version').notNull().default(1),

        createdAt: auditColumns.createdAt,
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__family_id_fk`,
            columns: [table.familyId],
            foreignColumns: [families.id],
        }).onDelete('cascade'),

        uniqueIndex(`${TABLE_NAME}__family_period_unique_index`).on(table.familyId, table.period),

        check(
            `${TABLE_NAME}__created_at_not_in_future_check`,
            sql`${table.createdAt} <= CURRENT_TIMESTAMP`,
        ),
    ],
);
