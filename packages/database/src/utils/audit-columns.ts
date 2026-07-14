import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';

export const auditColumns = {
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
};
