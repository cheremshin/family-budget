/** @type {import("prettier").Config} */
export default {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    arrowParens: 'always',

    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: [
        '^server-only$',
        '^react$',
        '^react-dom$',
        '^next$',
        '^next/(.*)$',
        '<THIRD_PARTY_MODULES>',
        '^@family-budget/(.*)$',
        '^@/(.*)$',
        '^[./]',
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,

    importOrderParserPlugins: ['decorators', 'typescript', 'jsx'],
};
