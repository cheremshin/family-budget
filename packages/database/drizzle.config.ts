import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;
if (!url) {
    throw new Error(
        'DATABASE_URL не задан. Локально запускайте через just migrate / just generate / just studio',
    );
}

export default defineConfig({
    schema: ['./src/schema/*.enum.ts', './src/schema/*.schema.ts'],
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: { url },
    verbose: true,
    strict: true,
});
