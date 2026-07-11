import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../../.env.local') });

const {
    DATABASE_URL,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
    POSTGRES_PORT = '5432',
} = process.env;

const url =
    DATABASE_URL ??
    `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}`;

export default defineConfig({
    schema: ['./src/schema/*.enum.ts', './src/schema/*.schema.ts'],
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: { url },
    verbose: true,
    strict: true,
});
