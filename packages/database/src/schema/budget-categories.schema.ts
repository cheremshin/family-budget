import { sql } from 'drizzle-orm';
import {
    PgTableExtraConfigValue,
    boolean,
    check,
    decimal,
    foreignKey,
    index,
    integer,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

import { auditColumns } from '../utils/audit-columns';
import {
    auditNotInFutureChecks,
    nonEmptyCheck,
    targetAmountConsistencyCheck,
} from '../utils/checks';
import { budgetCategoryType } from './budget-category-type.enum';
import { calculationMode } from './calculation-mode.enum';
import { families } from './families.schema';

const TABLE_NAME = 'budget_categories';

export const budgetCategories = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        familyId: uuid('family_id').notNull(),

        name: varchar('name', { length: 128 }).notNull(),
        type: budgetCategoryType('type').notNull(),
        calculationMode: calculationMode('calculation_mode').notNull(),
        targetAmount: decimal('target_amount', {
            precision: 12,
            scale: 2,
        })
            .notNull()
            .default('0'),
        sortOrder: integer('sort_order').notNull().default(0),

        isSystem: boolean('is_system').notNull().default(false),

        archived: boolean('archived').notNull().default(false),
        archivedAt: timestamp('archived_at', {
            withTimezone: true,
            mode: 'date',
        }),
        createdAt: auditColumns.createdAt,
        updatedAt: auditColumns.updatedAt,
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__family_id_fk`,
            columns: [table.familyId],
            foreignColumns: [families.id],
        }).onDelete('cascade'),

        uniqueIndex(`${TABLE_NAME}__family_name_active_unique_index`)
            .on(table.familyId, table.name)
            .where(sql`${table.archived} = false`),

        index(`${TABLE_NAME}__family_id`).on(table.familyId),

        nonEmptyCheck(`${TABLE_NAME}__name_format_check`, table.name),
        check(
            `${TABLE_NAME}__system_not_archived_check`,
            sql`(NOT ${table.isSystem}) OR (NOT ${table.archived})`,
        ),
        targetAmountConsistencyCheck(TABLE_NAME, table.calculationMode, table.targetAmount),
        check(
            `${TABLE_NAME}__archived_at_consistency_check`,
            sql`
                (${table.archived} = false AND ${table.archivedAt} IS NULL)
                OR
                (${table.archived} = true
                    AND ${table.archivedAt} IS NOT NULL
                    AND ${table.archivedAt} <= CURRENT_TIMESTAMP
                )
            `,
        ),
        auditNotInFutureChecks(TABLE_NAME, table),
    ],
);
