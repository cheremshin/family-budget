/**
 * date.ts - месяц бюджета это первое число ('2026-08-01'). Сервер и клиент обязаны считать
 * месяц одним кодом, иначе расходятся ключи кэша.
 *
 * Функции работают в ЛОКАЛЬНОМ календаре (getFullYear/getMonth/getDate). Даты в тестах тоже
 * строятся локально (new Date(год, месяц, день, …)), поэтому ожидания одинаковы в любом поясе.
 * Гонять под двумя поясами: `pnpm test:tz` - если перейти на toISOString() (UTC),
 * в поясе +07 граница суток уедет и тесты упадут.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
    type Period,
    periodSchema,
    resolvePeriodParam,
    shiftPeriod,
    toIsoDate,
    toPeriod,
    toPeriodParam,
    toStartOfYear,
} from './date';

const TODAY: Period = '2026-10-01';

/** Любой период 2000–2099 */
const periodArbitary = fc
    .tuple(fc.integer({ min: 2000, max: 2099 }), fc.integer({ min: 1, max: 12 }))
    .map(([year, month]): Period => `${year}-${String(month).padStart(2, '0')}-01`);

describe('toPeriod и toIsoDate', () => {
    it('граница суток: последний момент месяца и первый момент следующего', () => {
        expect(toPeriod(new Date(2026, 7, 31, 23, 59, 59))).toBe('2026-08-01');
        expect(toPeriod(new Date(2026, 8, 1, 0, 0, 0))).toBe('2026-09-01');
    });

    it('граница года', () => {
        expect(toPeriod(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-01');
        expect(toPeriod(new Date(2027, 0, 1, 0, 0))).toBe('2027-01-01');
    });

    it('toIsoDate дополняет месяц и день нулями', () => {
        expect(toIsoDate(new Date(2026, 2, 5))).toBe('2026-03-05');
    });
});

describe('shiftPeriod', () => {
    it.each([
        ['2026-12-01', 1, '2027-01-01'],
        ['2026-01-01', -1, '2025-12-01'],
        ['2026-08-01', 12, '2027-08-01'],
        ['2026-08-01', -25, '2024-07-01'],
        ['2026-08-01', 0, '2026-08-01'],
    ] as const)('%s на %i → %s', (period, months, expected) => {
        expect(shiftPeriod(period, months)).toBe(expected);
    });

    it('вперёд на n и назад на n возвращает тот же месяц', () => {
        fc.assert(
            fc.property(periodArbitary, fc.integer({ min: -240, max: 240 }), (period, n) => {
                expect(shiftPeriod(shiftPeriod(period, n), -n)).toBe(period);
            }),
        );
    });
});

describe('?period= в URL', () => {
    it("'2026-08' → август", () => {
        expect(resolvePeriodParam('2026-08', TODAY)).toBe('2026-08-01');
    });

    it('массив → первый элемент', () => {
        expect(resolvePeriodParam(['2026-08', '2026-09'], TODAY)).toBe('2026-08-01');
    });

    // мусор не должен тихо превращаться в другой месяц: страница редиректит его на каноничный URL
    it.each(['2026-13', '2026-00', '2026-8', 'abc', '', '2026-08-15', null, undefined])(
        'мусор %j → сегодняшний месяц',
        (raw) => {
            expect(resolvePeriodParam(raw, TODAY)).toBe(TODAY);
        },
    );

    it('каноничный вид устойчив: разбор после форматирования даёт тот же период', () => {
        fc.assert(
            fc.property(periodArbitary, (period) => {
                expect(resolvePeriodParam(toPeriodParam(period), TODAY)).toBe(period);
            }),
        );
    });

    it('toPeriodParam отрезает день', () => {
        expect(toPeriodParam('2026-08-01')).toBe('2026-08');
    });
});

describe('periodSchema и toStartOfYear', () => {
    it.each(['2026-08-15', '2026-02-30', '2026-13-01', '2026-8-01'])('отвергает %j', (value) => {
        expect(periodSchema.safeParse(value).success).toBe(false);
    });

    it('принимает первое число', () => {
        expect(periodSchema.safeParse('2026-08-01').success).toBe(true);
    });

    it('начало года', () => {
        expect(toStartOfYear('2026-08-01')).toBe('2026-01-01');
    });
});
