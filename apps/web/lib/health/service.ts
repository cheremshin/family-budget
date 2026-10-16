import { db, sql } from '@family-budget/database';

const DB_TIMEOUT_MS = 2_000;

export async function isDatabaseReady(): Promise<boolean> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('db healthcheck timeout')), DB_TIMEOUT_MS);
    });

    try {
        await Promise.race([db.execute(sql`SELECT 1`), timeout]);
        return true;
    } catch (error) {
        console.error('[health] database check failed', error);
        return false;
    } finally {
        clearTimeout(timer);
    }
}
