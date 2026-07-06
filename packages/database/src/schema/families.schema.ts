import { sql } from 'drizzle-orm';
import {
    check,
    integer,
    pgTable,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

export const families = pgTable(
    'families',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        name: varchar('name', { length: 128 }).notNull(),
        invitationCode: varchar('invitation_code', { length: 8 }).notNull(),
        maxMembers: integer('max_members').default(2).notNull(),
        membersCount: integer('members_count').default(1).notNull(),
    },
    (table) => [
        uniqueIndex('families__invitation_code_unique_index').on(
            table.invitationCode,
        ),

        check(
            'families__members_count_leq_max_members_check',
            sql`${table.membersCount} <= ${table.maxMembers}`,
        ),
    ],
);
