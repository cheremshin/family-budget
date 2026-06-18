import { sql } from 'drizzle-orm';
import {
    check,
    foreignKey,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { families } from './families.schema';

export const users = pgTable(
    'users',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        username: varchar('username', { length: 128 }).notNull(),
        passwordHash: varchar('password_hash', { length: 128 }).notNull(),

        familyId: uuid('family_id'),

        createdAt: timestamp('created_at', { mode: 'date' })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'date' })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        foreignKey({
            name: 'user_family_id',
            columns: [table.familyId],
            foreignColumns: [families.id],
        }),

        uniqueIndex('users__username_unique_index').on(table.username),

        check(
            'users__username_format_check',
            sql`(length(trim(${table.username})) > 0) AND (lower(${table.username}) = ${table.username})`,
        ),
        check(
            'users__created_at_not_in_future_check',
            sql`${table.createdAt} <= CURRENT_TIMESTAMP`,
        ),
        check(
            'users__updated_at_not_in_future_check',
            sql`${table.updatedAt} <= CURRENT_TIMESTAMP`,
        ),
    ],
);
