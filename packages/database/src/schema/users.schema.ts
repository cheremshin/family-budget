import {
    PgTableExtraConfigValue,
    foreignKey,
    index,
    pgTable,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

import { auditColumns } from '../utils/audit-columns';
import { auditNotInFutureChecks, lowercaseNonEmptyCheck } from '../utils/checks';
import { families } from './families.schema';

const TABLE_NAME = 'users';

export const users = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),
        username: varchar('username', { length: 128 }).notNull(),
        passwordHash: varchar('password_hash', { length: 128 }).notNull(),

        familyId: uuid('family_id'),

        createdAt: auditColumns.createdAt,
        updatedAt: auditColumns.updatedAt,
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__family_id_fk`,
            columns: [table.familyId],
            foreignColumns: [families.id],
        }).onDelete('set null'),

        uniqueIndex(`${TABLE_NAME}__username_unique_index`).on(table.username),
        index(`${TABLE_NAME}__family_id_index`).on(table.familyId),

        lowercaseNonEmptyCheck(`${TABLE_NAME}__username_format_check`, table.username),
        ...auditNotInFutureChecks(TABLE_NAME, table),
    ],
);
