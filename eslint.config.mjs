import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    tseslint.configs.recommended,
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/migrations/**'],
    },
    eslintConfigPrettier,
    {
        plugins: {
            import: importPlugin,
        },
        rules: {
            'import/no-relative-packages': 'error',
            'import/no-unresolved': 'error',
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: [
                        './tsconfig.json',
                        './apps/*/tsconfig.json',
                        './packages/*/tsconfig.json',
                    ],
                },
            },
        },
    },
);
