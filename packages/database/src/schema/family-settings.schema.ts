import { foreignKey, pgTable, PgTableExtraConfigValue, uuid } from 'drizzle-orm/pg-core';
import { budgetDivisionType } from './budget-division.enum';
import { families } from './families.schema';

const TABLE_NAME = 'family_settings';

export const familySettings = pgTable(
    TABLE_NAME,
    {
        familyId: uuid('family_id').primaryKey(),
        budgetDivisionType: budgetDivisionType('budget_division_type')
            .notNull()
            .default('in_proportion'),
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__family_fk`,
            columns: [table.familyId],
            foreignColumns: [families.id],
        }).onDelete('cascade'),
    ],
);
