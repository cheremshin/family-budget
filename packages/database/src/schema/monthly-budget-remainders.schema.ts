import { sql } from 'drizzle-orm';
import {
    PgTableExtraConfigValue,
    check,
    decimal,
    foreignKey,
    pgTable,
    primaryKey,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

import { monthlyBudgets } from './monthly-budgets.schema';
import { users } from './users.schema';

const TABLE_NAME = 'monthly_budget_remainders';

export const monthlyBudgetRemainders = pgTable(
    TABLE_NAME,
    {
        monthlyBudgetId: uuid('monthly_budget_id').notNull(),
        memberId: uuid('member_id').notNull(),
        memberName: varchar('member_name', { length: 128 }).notNull(),
        ownRemainder: decimal('own_remainder', { precision: 12, scale: 2 }).notNull(),
        personalAmount: decimal('personal_amount', { precision: 12, scale: 2 }).notNull(),
        settlementAmount: decimal('settlement_amount', { precision: 12, scale: 2 }).notNull(),
    },
    (table): PgTableExtraConfigValue[] => [
        primaryKey({
            name: `${TABLE_NAME}__pk`,
            columns: [table.monthlyBudgetId, table.memberId],
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

        // При перерасходе месяц не закрывается (rules.md)
        check(
            `${TABLE_NAME}__personal_amount_non_negative_check`,
            sql`${table.personalAmount} >= 0`,
        ),
    ],
);
