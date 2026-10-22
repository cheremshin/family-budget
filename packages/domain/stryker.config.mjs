/**
 * Мутационная проверка тестов расчёта: Stryker вносит в код мелкие ошибки и смотрит, упадут ли
 * тесты. Выживший мутант - место, где тест не проверяет поведение. Запуск вручную:
 * `pnpm test:mutation` в packages/domain, отчёт - reports/mutation/index.html.
 *
 * Временный инструмент на этапы 4–6 `docs/domain-migration.md`, когда переписывается расчёт;
 * после этапа 6 удаляется вместе с зависимостью `@stryker-mutator/core`.
 *
 * Раннер - `command`, а не `@stryker-mutator/vitest-runner`: тот выбирает тесты по имени через
 * `testNamePattern`, и с vitest 5 фильтр не находит ни одного теста - мутант «выживает» при нуле
 * выполненных тестов (проверено на 10.0.0). Command-раннер гоняет весь набор на каждого мутанта,
 * около полутора минут.
 *
 * Известные эквивалентные мутанты (выживают, но поведение не меняют; на 2026-10-22 их 14, счёт
 * 94.6%). Новый выживший сверх этого списка - повод разобраться.
 *   monthly-budget.calculation.ts
 *     takeFromRelative: `shortfall <= 0` -> `< 0` - при нулевой недостаче цикл ничего не снимает;
 *     takeFromRelative: `if (left === 0) break` (3 мутанта) - ранний выход, без него снимается 0;
 *     compareIds: вторая ветка `a > b ? 1 : 0` (4 мутанта) - участники упорядочены по id до
 *       сортировки, а сортировка устойчива.
 *   money.ts
 *     тексты ошибок схем (2) и исключения allocate (1) - не логика;
 *     allocate: `weights.length === 0 ||` -> `false ||` - пустые веса дают и нулевую сумму;
 *     allocate: `totalKopecks < 0` -> `<= 0` - при нуле все доли нулевые;
 *     allocate: `a.index - b.index` -> `+` - сортировка устойчива, индексы уже по возрастанию.
 *
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
    testRunner: 'command',
    commandRunner: { command: 'vitest run src/monthly-budget src/shared' },
    coverageAnalysis: 'off',
    mutate: ['src/monthly-budget/monthly-budget.calculation.ts', 'src/shared/money.ts'],
    reporters: ['clear-text', 'progress', 'html'],
    htmlReporter: { fileName: 'reports/mutation/index.html' },
    tempDirName: '.stryker-tmp',
    // Только подсветка в отчёте: прогон ручной, ничего не ломает
    thresholds: { high: 95, low: 90, break: null },
};
