import {
    PgTableExtraConfigValue,
    decimal,
    foreignKey,
    index,
    integer,
    pgTable,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

import { targetAmountConsistencyCheck } from '../utils/checks';
import { budgetCategories } from './budget-categories.schema';
import { calculationMode } from './calculation-mode.enum';
import { monthlyBudgets } from './monthly-budgets.schema';

const TABLE_NAME = 'monthly_budget_items';

export const monthlyBudgetItems = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        monthlyBudgetId: uuid('monthly_budget_id').notNull(),
        budgetCategoryId: uuid('budget_category_id').notNull(),

        calculationMode: calculationMode('calculation_mode').notNull(),
        targetAmount: decimal('target_amount', {
            precision: 12,
            scale: 2,
        })
            .notNull()
            .default('0'),

        sortOrder: integer('sort_order').notNull().default(0),
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__monthly_budget_id_fk`,
            columns: [table.monthlyBudgetId],
            foreignColumns: [monthlyBudgets.id],
        }).onDelete('cascade'),

        foreignKey({
            name: `${TABLE_NAME}__budget_category_id_fk`,
            columns: [table.budgetCategoryId],
            foreignColumns: [budgetCategories.id],
        }).onDelete('cascade'),

        uniqueIndex(`${TABLE_NAME}__budget_category_unique_index`).on(
            table.monthlyBudgetId,
            table.budgetCategoryId,
        ),
        index(`${TABLE_NAME}__budget_category_index`).on(table.budgetCategoryId),

        targetAmountConsistencyCheck(TABLE_NAME, table.calculationMode, table.targetAmount),
    ],
);
