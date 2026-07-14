import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    tseslint.configs.recommended,
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/migrations/**'],
    },
    eslintConfigPrettier,
);
