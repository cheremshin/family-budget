import {
    boolean,
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
        isFull: boolean('is_full').default(false).notNull(),
    },
    (table) => [
        uniqueIndex('families__invitation_code_unique_index').on(
            table.invitationCode,
        ),
    ],
);
