/**
 * money.ts - деньги выражаются decimal-строкой для безопасного хранения, математики и считаются в целых копейках.
 * Поддерживается decimal(12, 2) до 999_999_999_999 копеек
 *
 * allocate(total, weights) делит сумму по весам без потери копеек. Обещает:
 *   1. сумма долей равна total
 *   2. каждая доля отличается от точной пропорции меньше чем на копейку
 *   3. знак долей как у total
 *   4. нулевой вес получает ноль
 *   5. лишние копейки уходят к большему дробному остатку, при равенстве меньшему индексу
 *
 * веса >= 0, сумма > 0, иначе исключение
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
    allocate,
    fromKopecks,
    moneySchema,
    percentOf,
    signedMoneySchema,
    sumMoney,
    toKopecks,
} from './money';

const MAX_KOPECKS = 999_999_999_999;

const signedKopecksArbitary = fc.integer({ min: -MAX_KOPECKS, max: MAX_KOPECKS });

const weightArbitary = fc.oneof(
    { weight: 1, arbitrary: fc.constant(0) },
    { weight: 4, arbitrary: fc.integer({ min: 1, max: MAX_KOPECKS }) },
);

const weightsArgbitary = fc
    .oneof(
        fc.array(weightArbitary, { minLength: 1, maxLength: 6 }),
        fc
            .tuple(fc.integer({ min: 1, max: 1_000 }), fc.integer({ min: 1, max: 6 }))
            .map(([weight, count]) => Array.from({ length: count }, () => weight)),
    )
    .filter((weights) => weights.some((w) => w > 0));

describe('конвертация', () => {
    it('туда и обратно без потерь на всём диапазоне колонки', () => {
        fc.assert(
            fc.property(signedKopecksArbitary, (kopecks) => {
                expect(toKopecks(fromKopecks(kopecks))).toBe(kopecks);
            }),
        );
    });

    it.each([
        [150, '1.50'],
        [5, '0.05'],
        [-5, '-0.05'],
        [0, '0.00'],
        [-0, '0.00'],
    ])('fromKopecks(%s) → %s', (kopecks, expected) => {
        expect(fromKopecks(kopecks)).toBe(expected);
    });

    it.each([
        ['1.5', 150],
        ['-0.5', -50],
        ['7', 700],
        ['0.05', 5],
    ])('toKopecks(%j) → %s: одна цифра после точки - десятки копеек', (amount, expected) => {
        expect(toKopecks(amount)).toBe(expected);
    });

    it.todo(
        'toKopecks на невалидной строке ("1.234", "abc") - вне контракта, защищает moneySchema',
    );
});

describe('allocate', () => {
    it('сумма долей равна total, долей столько же сколько весов', () => {
        fc.assert(
            fc.property(signedKopecksArbitary, weightsArgbitary, (total, weights) => {
                const parts = allocate(fromKopecks(total), weights);
                expect(parts).toHaveLength(weights.length);
                expect(parts.reduce((acc, part) => acc + toKopecks(part), 0)).toBe(total);
            }),
        );
    });

    it('доли отличаются от точной пропорции меньше, чем на копейку', () => {
        fc.assert(
            fc.property(signedKopecksArbitary, weightsArgbitary, (total, weights) => {
                const parts = allocate(fromKopecks(total), weights);
                const weightSum = BigInt(weights.reduce((acc, weight) => acc + weight, 0));
                const magnitude = BigInt(Math.abs(total));

                parts.forEach((part, i) => {
                    // |доля - |total| * вес / SUM(весов)| < 1
                    const diff =
                        BigInt(Math.abs(toKopecks(part))) * weightSum -
                        magnitude * BigInt(weights[i]);
                    expect(diff < weightSum && -diff < weightSum).toBe(true);
                });
            }),
        );
    });

    it('знак долей как у total', () => {
        fc.assert(
            fc.property(signedKopecksArbitary, weightsArgbitary, (total, weights) => {
                const parts = allocate(fromKopecks(total), weights);
                parts.forEach((part) => {
                    const kopecks = toKopecks(part);
                    expect(total < 0 ? kopecks <= 0 : kopecks >= 0).toBe(true);
                });
            }),
        );
    });

    it('нулевой вес получает ноль', () => {
        fc.assert(
            fc.property(signedKopecksArbitary, weightsArgbitary, (total, weights) => {
                const parts = allocate(fromKopecks(total), weights);
                weights.forEach((weight, i) => {
                    if (weight === 0) {
                        expect(toKopecks(parts[i])).toBe(0);
                    }
                });
            }),
        );
    });

    it('лишняя копейка при равенстве остатков уходит меньшему индексу', () => {
        expect(allocate('0.01', [1, 1])).toEqual(['0.01', '0.00']);
        expect(allocate('1.00', [1, 1, 1])).toEqual(['0.34', '0.33', '0.33']);
    });

    it('лишняя копейка уходит доле с большим дробным остатком', () => {
        // 0.05 на [1, 2]: точно 1.67 и 3.33 копейки. 1 и 3, лишняя - первой (остаток 0.67)
        expect(allocate('0.05', [1, 2])).toEqual(['0.02', '0.03']);
    });

    it('примеры: пропорция и знак', () => {
        expect(allocate('10.00', [3, 1])).toEqual(['7.50', '2.50']);
        expect(allocate('-0.01', [1, 1])).toEqual(['-0.01', '0.00']);
    });

    it('без весов или с нулевой суммой весов - исключение', () => {
        expect(() => allocate('1.00', [])).toThrow();
        expect(() => allocate('1.00', [0, 0])).toThrow();
    });

    it.todo('отрицательные веса - вне контракта: код их не проверяет, вызывающие передают копейки');
});

describe('percentOf', () => {
    it('половина копейки округляется вверх', () => {
        expect(percentOf('50.00', '0.57')).toBe('0.29'); // 28.5 коп
        expect(percentOf('50.00', '0.69')).toBe('0.35'); // 34.5 коп
        expect(percentOf('0.01', '50.00')).toBe('0.01'); // 0.5 коп
        expect(percentOf('0.01', '49.99')).toBe('0.00');
    });

    it('0% и 100%', () => {
        expect(percentOf('1234.56', '0')).toBe('0.00');
        expect(percentOf('1234.56', '100.00')).toBe('1234.56');
        expect(percentOf('0.00', '33.33')).toBe('0.00');
    });

    it('результат - ближайшая копейка, половина вверх, на всём диапазоне колонки', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: MAX_KOPECKS }),
                fc.integer({ min: 0, max: 10_000 }),
                (total, hundredths) => {
                    const result = BigInt(
                        toKopecks(percentOf(fromKopecks(total), fromKopecks(hundredths))),
                    );

                    const diff = BigInt(total) * BigInt(hundredths) - result * 10_000n;
                    expect(diff >= -5_000n && diff < 5_000n).toBe(true);
                },
            ),
        );
    });
});

describe('sumMoney', () => {
    it('складывает суммы со знаком', () => {
        expect(sumMoney(['1.50', '-0.75', '0.25'])).toBe('1.00');
        expect(sumMoney([])).toBe('0.00');
    });
});

describe('moneySchema: что считается деньгами', () => {
    it.each(['0', '1.5', '1.50', ' 12 ', '9999999999.99'])('принимает %j', (value) => {
        expect(moneySchema.safeParse(value).success).toBe(true);
    });

    it.each(['1.', '.5', '1.555', '-1', '10000000000', '1e3', '1,5', ''])(
        'отвергает %j',
        (value) => {
            expect(moneySchema.safeParse(value).success).toBe(false);
        },
    );

    it.each(['-1.50', '-0.01', '0', ' -12.5 ', '-9999999999.99'])(
        'signedMoneySchema принимает %j',
        (value) => {
            expect(signedMoneySchema.safeParse(value).success).toBe(true);
        },
    );

    it.each(['--1', '-', '+1', '-1.555', '-10000000000', '1.5x'])(
        'signedMoneySchema отвергает %j',
        (value) => {
            expect(signedMoneySchema.safeParse(value).success).toBe(false);
        },
    );
});
