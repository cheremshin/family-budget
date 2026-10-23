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
import { budgetDivisionType } from './budget-division.enum';
import { families } from './families.schema';
import { personalRemainderPolicy } from './personal-remainder-policy.enum';

const TABLE_NAME = 'monthly_budget';

export const monthlyBudgets = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        familyId: uuid('family_id').notNull(),

        period: date('period').notNull(),
        isClosed: boolean('is_closed').notNull().default(false),
        version: integer('version').notNull().default(1),
        budgetDivisionType: budgetDivisionType('budget_division_type'),
        personalRemainderPolicy: personalRemainderPolicy('personal_remainder_policy'),

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
            `${TABLE_NAME}__closed_has_division_type_check`,
            sql`${table.isClosed} = false OR ${table.budgetDivisionType} IS NOT NULL`,
        ),
        check(
            `${TABLE_NAME}__created_at_not_in_future_check`,
            sql`${table.createdAt} <= CURRENT_TIMESTAMP`,
        ),
    ],
);
