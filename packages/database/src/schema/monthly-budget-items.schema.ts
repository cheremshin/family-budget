import {
    PgTableExtraConfigValue,
    decimal,
    foreignKey,
    index,
    integer,
    pgTable,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

import { nonEmptyCheck, targetAmountConsistencyCheck } from '../utils/checks';
import { budgetCategories } from './budget-categories.schema';
import { budgetCategoryType } from './budget-category-type.enum';
import { calculationMode } from './calculation-mode.enum';
import { monthlyBudgets } from './monthly-budgets.schema';

const TABLE_NAME = 'monthly_budget_items';

export const monthlyBudgetItems = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        monthlyBudgetId: uuid('monthly_budget_id').notNull(),
        budgetCategoryId: uuid('budget_category_id').notNull(),

        categoryName: varchar('category_name', { length: 128 }).notNull(),
        categoryType: budgetCategoryType('category_type').notNull(),
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

        // Категория, попавшая в бюджет, физически не удаляется (можно только архивировать)
        foreignKey({
            name: `${TABLE_NAME}__budget_category_id_fk`,
            columns: [table.budgetCategoryId],
            foreignColumns: [budgetCategories.id],
        }).onDelete('no action'),

        uniqueIndex(`${TABLE_NAME}__budget_category_unique_index`).on(
            table.monthlyBudgetId,
            table.budgetCategoryId,
        ),
        index(`${TABLE_NAME}__budget_category_index`).on(table.budgetCategoryId),

        targetAmountConsistencyCheck(TABLE_NAME, table.calculationMode, table.targetAmount),
        nonEmptyCheck(`${TABLE_NAME}__category_name_not_empty_check`, table.categoryName),
    ],
);
