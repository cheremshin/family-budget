import { sql } from 'drizzle-orm';
import {
    check,
    foreignKey,
    index,
    integer,
    pgTable,
    PgTableExtraConfigValue,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { auditColumns } from '../utils/audit-columns';
import { nonEmptyCheck } from '../utils/checks';

const TABLE_NAME = 'families';

export const families = pgTable(
    TABLE_NAME,
    {
        id: uuid('id').defaultRandom().primaryKey(),

        name: varchar('name', { length: 128 }).notNull(),

        invitationCode: varchar('invitation_code', { length: 8 }).notNull(),
        maxMembers: integer('max_members').default(2).notNull(),

        ownerId: uuid('owner_id').notNull(),

        createdAt: auditColumns.createdAt,
    },
    (table): PgTableExtraConfigValue[] => [
        foreignKey({
            name: `${TABLE_NAME}__owner_id_fk`,
            columns: [table.ownerId],
            foreignColumns: [users.id],
        }).onDelete('restrict'),

        uniqueIndex(`${TABLE_NAME}__invitation_code_unique_index`).on(table.invitationCode),
        index(`${TABLE_NAME}__owner_id_index`).on(table.ownerId),

        check(`${TABLE_NAME}__max_members_check`, sql`${table.maxMembers} >= 1`),
        nonEmptyCheck(`${TABLE_NAME}__name_format_check`, table.name),
        check(
            `${TABLE_NAME}__invitation_code_format_check`,
            sql`${table.invitationCode} = upper(${table.invitationCode})`,
        ),
        check(
            `${TABLE_NAME}__created_at_not_in_future_check`,
            sql`${table.createdAt} <= CURRENT_TIMESTAMP`,
        ),
    ],
);
