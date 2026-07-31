import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { relations } from './relations';

const globalForDb = globalThis as unknown as {
    connection: postgres.Sql | undefined;
};

const connection = globalForDb.connection ?? postgres(process.env.DATABASE_URL!);

if (process.env.NODE_ENV !== 'production') {
    globalForDb.connection = connection;
}

export const db = drizzle({
    client: connection,
    relations,
});
