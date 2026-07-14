import {
    boolean,
    check,
    date,
    foreignKey,
    pgTable,
    PgTableExtraConfigValue,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';
import { families } from './families.schema';
import { sql } from 'drizzle-orm';
import { auditColumns } from '../utils/audit-columns';

const TABLE_NAME = 'monthly_budget';

export const monthlyBudgets = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        familyId: uuid('family_id').notNull(),

        period: date('period').notNull(),
        isClosed: boolean('is_closed').notNull().default(false),

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
