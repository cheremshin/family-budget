import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        // то же, что paths в tsconfig.json
        alias: { '@': import.meta.dirname },
    },
    test: {
        environment: 'node',
        include: ['**/*.test.ts'],
        exclude: ['node_modules/**', '.next/**'],
        passWithNoTests: true,
    },
});
