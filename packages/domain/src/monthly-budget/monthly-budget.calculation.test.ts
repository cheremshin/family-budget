import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { fromKopecks, toKopecks } from '../shared/money';
import {
    DistributionInput,
    DistributionItem,
    DistributionMember,
    DistributionResult,
    ROUNDING_TOLERANCE_KOPECKS,
    allocateReceipts,
    distribute,
    isOverAllocated,
} from './monthly-budget.calculation';

const ANYA = '00000000-0000-4000-8000-00000000000a';
const BORIS = '00000000-0000-4000-8000-00000000000b';
const VERA = '00000000-0000-4000-8000-00000000000c';

const CAT_1 = '10000000-0000-4000-8000-000000000001';
const CAT_2 = '10000000-0000-4000-8000-000000000002';
const CAT_3 = '10000000-0000-4000-8000-000000000003';
const ZERO_CAT = 'ffffffff-ffff-4fff-bfff-ffffffffffff';

const member = (memberId: string, plannedAmount: string): DistributionMember => ({
    memberId,
    plannedAmount,
});

const absolute = (categoryId: string, targetAmount: string): DistributionItem => ({
    categoryId,
    calculationMode: 'absolute',
    targetAmount,
});

const relative = (categoryId: string, targetAmount: string): DistributionItem => ({
    categoryId,
    calculationMode: 'relative',
    targetAmount,
});

const contributionOf = (result: DistributionResult, memberId: string, categoryId: string) =>
    result.contributions.find((c) => c.memberId === memberId && c.categoryId === categoryId)
        ?.amount;

const remainderOf = (result: DistributionResult, memberId: string) =>
    result.remainders.find((r) => r.memberId === memberId)!;

const sumKopecks = (amounts: string[]) => amounts.reduce((acc, a) => acc + toKopecks(a), 0);

const compareIds = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Результат в каноничном порядке - для сравнения независимо от порядка во входе */
const normalize = (result: DistributionResult) => ({
    contributions: [...result.contributions].sort(
        (a, b) => compareIds(a.memberId, b.memberId) || compareIds(a.categoryId, b.categoryId),
    ),
    remainders: [...result.remainders].sort((a, b) => compareIds(a.memberId, b.memberId)),
});

const big = (amount: string) => BigInt(toKopecks(amount));
const sumBig = (values: bigint[]) => values.reduce((acc, v) => acc + v, 0n);

/** Веса деления: `in_half` - поровну, `in_proportion` - по плану, при нулевых планах - поровну */
function weightsBySpec(input: DistributionInput): Map<string, bigint> {
    const plans = input.members.map((m) => big(m.plannedAmount));
    const proportional = input.divisionType === 'in_proportion' && plans.some((p) => p > 0n);
    return new Map(input.members.map((m, i) => [m.memberId, proportional ? plans[i] : 1n]));
}

/** Требование категории: сумма или процент от суммы планов, половина копейки вверх */
function requiredBySpec(item: DistributionItem, totalPlanned: bigint): bigint {
    if (item.calculationMode === 'absolute') return big(item.targetAmount);
    // процент в сотых долях: '33.33' -> 3333; копейки × сотые / 10 000
    return (totalPlanned * big(item.targetAmount) + 5_000n) / 10_000n;
}

/** |part · Σw − total · w| < Σw, то есть часть отличается от точной доли меньше чем на копейку */
function isNearExactShare(part: bigint, total: bigint, weight: bigint, weightSum: bigint) {
    const diff = part * weightSum - total * weight;
    return (diff < 0n ? -diff : diff) < weightSum;
}

/** Сырая недостача по модели: сумма требований минус сумма планов */
function rawShortfall(input: DistributionInput): bigint {
    const totalPlanned = sumBig(input.members.map((m) => big(m.plannedAmount)));
    return sumBig(input.items.map((item) => requiredBySpec(item, totalPlanned))) - totalPlanned;
}

/** Сколько недостачи округления погашено: сырое требование минус фактические вклады */
function absorbedKopecks(input: DistributionInput, result: DistributionResult): bigint {
    const totalPlanned = sumBig(input.members.map((m) => big(m.plannedAmount)));
    const required = sumBig(input.items.map((item) => requiredBySpec(item, totalPlanned)));
    return required - sumBig(result.contributions.map((c) => big(c.amount)));
}

describe('distribute: примеры из distribution.md', () => {
    it('П1 — дефицит: недостачу Ани закрывает перевод Бориса', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '100000.00')],
            members: [member(ANYA, '30000.00'), member(BORIS, '200000.00')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('50000.00');
        expect(contributionOf(result, BORIS, CAT_1)).toBe('50000.00');
        expect(remainderOf(result, ANYA)).toEqual({
            memberId: ANYA,
            ownRemainder: '-20000.00',
            personalAmount: '65000.00',
            settlementAmount: '-85000.00',
        });
        expect(remainderOf(result, BORIS)).toEqual({
            memberId: BORIS,
            ownRemainder: '150000.00',
            personalAmount: '65000.00',
            settlementAmount: '85000.00',
        });
        expect(isOverAllocated(result)).toBe(false);
    });

    describe('смесь фиксированных и процентных категорий', () => {
        const items = [
            absolute(CAT_1, '45000.00'),
            relative(CAT_2, '15.00'),
            relative(CAT_3, '7.50'),
        ];
        const members = [member(ANYA, '120000.00'), member(BORIS, '180000.00')];

        it('П2 — in_half: вклады поровну, перевод выравнивает остатки', () => {
            const result = distribute({
                divisionType: 'in_half',
                personalRemainderPolicy: 'equalized',
                items,
                members,
            });

            expect(contributionOf(result, ANYA, CAT_1)).toBe('22500.00');
            expect(contributionOf(result, ANYA, CAT_2)).toBe('22500.00');
            expect(contributionOf(result, ANYA, CAT_3)).toBe('11250.00');
            expect(remainderOf(result, ANYA)).toMatchObject({
                ownRemainder: '63750.00',
                personalAmount: '93750.00',
                settlementAmount: '-30000.00',
            });
            expect(remainderOf(result, BORIS)).toMatchObject({
                ownRemainder: '123750.00',
                personalAmount: '93750.00',
                settlementAmount: '30000.00',
            });
        });

        it('П3 — in_proportion: вклады 2 : 3, личная часть та же, меняется только перевод', () => {
            const result = distribute({
                divisionType: 'in_proportion',
                personalRemainderPolicy: 'equalized',
                items,
                members,
            });

            expect(contributionOf(result, ANYA, CAT_1)).toBe('18000.00');
            expect(contributionOf(result, BORIS, CAT_1)).toBe('27000.00');
            expect(contributionOf(result, ANYA, CAT_3)).toBe('9000.00');
            expect(contributionOf(result, BORIS, CAT_3)).toBe('13500.00');
            expect(remainderOf(result, ANYA)).toMatchObject({
                ownRemainder: '75000.00',
                personalAmount: '93750.00',
                settlementAmount: '-18750.00',
            });
            expect(remainderOf(result, BORIS)).toMatchObject({
                ownRemainder: '112500.00',
                personalAmount: '93750.00',
                settlementAmount: '18750.00',
            });
        });
    });

    it('П4 — три участника: лишние копейки по наибольшим остаткам, затем по id', () => {
        const result = distribute({
            divisionType: 'in_proportion',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '100.01'), relative(CAT_2, '12.34')],
            members: [member(VERA, '0.01'), member(BORIS, '666.67'), member(ANYA, '333.33')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('33.34');
        expect(contributionOf(result, BORIS, CAT_1)).toBe('66.67');
        expect(contributionOf(result, VERA, CAT_1)).toBe('0.00');
        expect(contributionOf(result, ANYA, CAT_2)).toBe('41.13');
        expect(contributionOf(result, BORIS, CAT_2)).toBe('82.27');
        expect(contributionOf(result, VERA, CAT_2)).toBe('0.00');
        expect(remainderOf(result, ANYA)).toMatchObject({
            ownRemainder: '258.86',
            personalAmount: '258.87',
            settlementAmount: '-0.01',
        });
        expect(remainderOf(result, BORIS)).toMatchObject({
            ownRemainder: '517.73',
            personalAmount: '258.87',
            settlementAmount: '258.86',
        });
        expect(remainderOf(result, VERA)).toMatchObject({
            ownRemainder: '0.01',
            personalAmount: '258.86',
            settlementAmount: '-258.85',
        });
    });

    it('П5 — in_proportion: участник с нулевым планом не вносит, если у другого план есть', () => {
        const result = distribute({
            divisionType: 'in_proportion',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '1000.00')],
            members: [member(ANYA, '0.00'), member(BORIS, '100000.00')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('0.00');
        expect(contributionOf(result, BORIS, CAT_1)).toBe('1000.00');
    });

    it('П6 — in_proportion при нулевых планах у всех делится поровну', () => {
        const result = distribute({
            divisionType: 'in_proportion',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '100.00')],
            members: [member(ANYA, '0.00'), member(BORIS, '0.00')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('50.00');
        expect(contributionOf(result, BORIS, CAT_1)).toBe('50.00');
    });

    it('П7 — процентная категория считается от суммы планов всех участников', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [relative(CAT_1, '10.00')],
            members: [member(ANYA, '100000.00'), member(BORIS, '300000.00')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('20000.00');
        expect(contributionOf(result, BORIS, CAT_1)).toBe('20000.00');
    });

    it('П8 — individual: личная часть равна своему остатку, перевода нет', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'individual',
            items: [absolute(CAT_1, '100000.00')],
            members: [member(ANYA, '30000.00'), member(BORIS, '200000.00')],
        });

        expect(remainderOf(result, ANYA)).toMatchObject({
            personalAmount: '-20000.00',
            settlementAmount: '0.00',
        });
        expect(remainderOf(result, BORIS)).toMatchObject({
            personalAmount: '150000.00',
            settlementAmount: '0.00',
        });
        expect(isOverAllocated(result)).toBe(true);
    });

    describe.each(['equalized', 'individual'] as const)(
        'П9 — допуск округления, один участник, политика %s',
        (policy) => {
            const input: DistributionInput = {
                divisionType: 'in_half',
                personalRemainderPolicy: policy,
                items: [
                    relative(CAT_1, '33.33'),
                    relative(CAT_2, '33.33'),
                    relative(CAT_3, '33.34'),
                ],
                members: [member(ANYA, '100.02')],
            };

            it('недостача гасится: вклады ровно в план, личная часть 0.00', () => {
                const result = distribute(input);

                expect(sumKopecks(result.contributions.map((c) => c.amount))).toBe(10002);
                expect(remainderOf(result, ANYA).personalAmount).toBe('0.00');
                expect(isOverAllocated(result)).toBe(false);
            });

            it('копейка снимается с крупнейшего процентного вклада (33.35 -> 33.34)', () => {
                const result = distribute(input);

                expect(contributionOf(result, ANYA, CAT_1)).toBe('33.34');
                expect(contributionOf(result, ANYA, CAT_2)).toBe('33.34');
                expect(contributionOf(result, ANYA, CAT_3)).toBe('33.34');
            });
        },
    );

    it('П10 — допуск при individual считается у каждого участника отдельно', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'individual',
            items: [relative(CAT_1, '33.33'), relative(CAT_2, '33.33'), relative(CAT_3, '33.34')],
            members: [member(ANYA, '50.01'), member(BORIS, '50.01')],
        });

        for (const contribution of result.contributions) {
            expect(contribution.amount).toBe('16.67');
        }
        for (const remainder of result.remainders) {
            expect(remainder).toMatchObject({
                ownRemainder: '0.00',
                personalAmount: '0.00',
                settlementAmount: '0.00',
            });
        }
    });

    it('П11 — при равенстве вкладов недостача снимается с категории с меньшим id', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'individual',
            items: [relative(CAT_2, '50.00'), relative(CAT_1, '50.00')],
            members: [member(ANYA, '0.05')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('0.02');
        expect(contributionOf(result, ANYA, CAT_2)).toBe('0.03');
        expect(remainderOf(result, ANYA).personalAmount).toBe('0.00');
    });

    it('П12 — при равных вкладах в категории недостача снимается с участника с меньшим id', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [relative(CAT_2, '50.00'), relative(CAT_1, '50.00')],
            members: [member(BORIS, '0.03'), member(ANYA, '0.04')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('0.01');
        expect(contributionOf(result, BORIS, CAT_1)).toBe('0.02');
        expect(contributionOf(result, ANYA, CAT_2)).toBe('0.02');
        expect(contributionOf(result, BORIS, CAT_2)).toBe('0.02');
        expect(remainderOf(result, ANYA)).toMatchObject({
            ownRemainder: '0.01',
            personalAmount: '0.00',
            settlementAmount: '0.01',
        });
        expect(remainderOf(result, BORIS)).toMatchObject({
            ownRemainder: '-0.01',
            personalAmount: '0.00',
            settlementAmount: '-0.01',
        });
        expect(isOverAllocated(result)).toBe(false);
    });

    it('П13 — individual: недостача гасится вкладом того, у кого она возникла', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'individual',
            items: [relative(CAT_1, '50.50')],
            members: [member(ANYA, '3.00'), member(BORIS, '1.00')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('1.01');
        expect(contributionOf(result, BORIS, CAT_1)).toBe('1.00');
        expect(remainderOf(result, ANYA).personalAmount).toBe('1.99');
        expect(remainderOf(result, BORIS)).toMatchObject({
            ownRemainder: '0.00',
            personalAmount: '0.00',
        });
        expect(isOverAllocated(result)).toBe(false);
    });

    it('П14 — процентных вкладов ровно столько, сколько недостачи: гасится', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '1.00'), relative(CAT_2, '1.00')],
            members: [member(ANYA, '1.00')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('1.00');
        expect(contributionOf(result, ANYA, CAT_2)).toBe('0.00');
        expect(remainderOf(result, ANYA).personalAmount).toBe('0.00');
        expect(isOverAllocated(result)).toBe(false);
    });

    it('П15 — граница допуска: 100 копеек гасится, 101 - перерасход', () => {
        expect(ROUNDING_TOLERANCE_KOPECKS).toBe(100);
        const base = {
            divisionType: 'in_half' as const,
            personalRemainderPolicy: 'equalized' as const,
            members: [member(ANYA, '100.00')],
        };

        const atLimit = distribute({
            ...base,
            items: [relative(CAT_1, '50.00'), relative(CAT_2, '51.00')],
        });
        expect(sumKopecks(atLimit.contributions.map((c) => c.amount))).toBe(10000);
        expect(isOverAllocated(atLimit)).toBe(false);

        const overLimit = distribute({
            ...base,
            items: [relative(CAT_1, '50.00'), relative(CAT_2, '51.01')],
        });
        expect(sumKopecks(overLimit.contributions.map((c) => c.amount))).toBe(10101);
        expect(remainderOf(overLimit, ANYA).personalAmount).toBe('-1.01');
        expect(isOverAllocated(overLimit)).toBe(true);
    });

    it('П16 — фиксированные суммы допуском не трогаются', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '100.50'), relative(CAT_2, '0.00')],
            members: [member(ANYA, '100.00')],
        });

        expect(contributionOf(result, ANYA, CAT_1)).toBe('100.50');
        expect(remainderOf(result, ANYA).personalAmount).toBe('-0.50');
        expect(isOverAllocated(result)).toBe(true);
    });

    it('П17 — частично недостачу не гасят', () => {
        const result = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '100.40'), relative(CAT_2, '0.30')],
            members: [member(ANYA, '100.00')],
        });

        expect(contributionOf(result, ANYA, CAT_2)).toBe('0.30');
        expect(remainderOf(result, ANYA).personalAmount).toBe('-0.70');
        expect(isOverAllocated(result)).toBe(true);
    });

    it('без участников - пустой результат', () => {
        expect(
            distribute({
                divisionType: 'in_half',
                personalRemainderPolicy: 'equalized',
                items: [absolute(CAT_1, '10.00')],
                members: [],
            }),
        ).toEqual({ contributions: [], remainders: [] });
    });
});

describe('allocateReceipts: примеры из distribution.md', () => {
    const deficit = distribute({
        divisionType: 'in_half',
        personalRemainderPolicy: 'equalized',
        items: [absolute(CAT_1, '100000.00')],
        members: [member(ANYA, '30000.00'), member(BORIS, '200000.00')],
    });

    it('П18 — дефицит: весь транш Ани уходит в категорию', () => {
        const result = allocateReceipts({
            remainder: remainderOf(deficit, ANYA),
            contributions: deficit.contributions.filter((c) => c.memberId === ANYA),
            receipts: [{ id: 'r1', amount: '30000.00' }],
        });

        expect(result).toEqual({
            kind: 'allocated',
            receipts: [
                {
                    receiptId: 'r1',
                    categories: [{ categoryId: CAT_1, amount: '30000.00' }],
                    ownAmount: '0.00',
                },
            ],
        });
    });

    it('П19 — перерасход: разбивка недоступна', () => {
        const over = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '200.00')],
            members: [member(ANYA, '100.00')],
        });

        expect(
            allocateReceipts({
                remainder: remainderOf(over, ANYA),
                contributions: over.contributions,
                receipts: [{ id: 'r1', amount: '10.00' }],
            }),
        ).toEqual({ kind: 'unavailable', reason: 'over-allocated' });
    });

    it('П20 — все веса нулевые: весь транш в ownAmount', () => {
        const zero = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '0.00')],
            members: [member(ANYA, '0.00')],
        });

        expect(
            allocateReceipts({
                remainder: remainderOf(zero, ANYA),
                contributions: zero.contributions,
                receipts: [{ id: 'r1', amount: '10.00' }],
            }),
        ).toEqual({
            kind: 'allocated',
            receipts: [
                {
                    receiptId: 'r1',
                    categories: [{ categoryId: CAT_1, amount: '0.00' }],
                    ownAmount: '10.00',
                },
            ],
        });
    });

    it('П21 — транш делится по весам вкладов и своего остатка', () => {
        const ordinary = distribute({
            divisionType: 'in_half',
            personalRemainderPolicy: 'equalized',
            items: [absolute(CAT_1, '40000.00'), absolute(CAT_2, '10000.00')],
            members: [member(ANYA, '100000.00')],
        });

        expect(
            allocateReceipts({
                remainder: remainderOf(ordinary, ANYA),
                contributions: ordinary.contributions,
                receipts: [{ id: 'r1', amount: '30000.00' }],
            }),
        ).toEqual({
            kind: 'allocated',
            receipts: [
                {
                    receiptId: 'r1',
                    categories: [
                        { categoryId: CAT_1, amount: '12000.00' },
                        { categoryId: CAT_2, amount: '3000.00' },
                    ],
                    ownAmount: '15000.00',
                },
            ],
        });
    });
});

const NUM_RUNS = 200;

const membersArbitrary = (maxKopecks: fc.Arbitrary<number>, maxLength: number) =>
    fc
        .uniqueArray(fc.tuple(fc.uuid(), maxKopecks), {
            minLength: 1,
            maxLength,
            selector: ([id]) => id,
        })
        .map((members) =>
            members.map(([memberId, kopecks]) => member(memberId, fromKopecks(kopecks))),
        );

const divisionArbitrary = fc.constantFrom('in_half' as const, 'in_proportion' as const);
const policyArbitrary = fc.constantFrom('individual' as const, 'equalized' as const);

/** Обычные месяцы: смесь категорий, суммы до 100 000 ₽ */
const typicalArbitrary: fc.Arbitrary<DistributionInput> = fc.record({
    divisionType: divisionArbitrary,
    personalRemainderPolicy: policyArbitrary,
    members: membersArbitrary(fc.integer({ min: 0, max: 10_000_000 }), 4),
    items: fc
        .uniqueArray(
            fc.tuple(
                fc.uuid(),
                fc.oneof(
                    fc.integer({ min: 1, max: 5_000_000 }).map((k) => ['absolute', k] as const),
                    fc.integer({ min: 0, max: 10_000 }).map((h) => ['relative', h] as const),
                ),
            ),
            { maxLength: 6, selector: ([id]) => id },
        )
        .map((items) =>
            items.map(([categoryId, [mode, value]]) =>
                mode === 'absolute'
                    ? absolute(categoryId, fromKopecks(value))
                    : relative(categoryId, fromKopecks(value)),
            ),
        ),
});

/** Зона допуска: проценты дают ровно 100%, а округление - недостачу в копейки */
const toleranceArbitrary: fc.Arbitrary<DistributionInput> = fc
    .record({
        divisionType: divisionArbitrary,
        personalRemainderPolicy: policyArbitrary,
        members: membersArbitrary(fc.integer({ min: 1, max: 10_000_000 }), 3),
        items: fc
            .integer({ min: 3, max: 8 })
            .chain((count) =>
                fc.tuple(
                    fc.uniqueArray(fc.integer({ min: 1, max: 9_999 }), {
                        minLength: count - 1,
                        maxLength: count - 1,
                    }),
                    fc.uniqueArray(fc.uuid(), { minLength: count, maxLength: count }),
                ),
            )
            .map(([cuts, ids]) => {
                const bounds = [0, ...[...cuts].sort((a, b) => a - b), 10_000];
                return ids.map((id, i) => relative(id, fromKopecks(bounds[i + 1] - bounds[i])));
            }),
    })
    .filter((input) => rawShortfall(input) > 0n);

/** Предельные суммы колонки decimal(12, 2): проверка точности на больших числах */
const hugeArbitrary: fc.Arbitrary<DistributionInput> = fc.record({
    divisionType: divisionArbitrary,
    personalRemainderPolicy: policyArbitrary,
    members: membersArbitrary(fc.bigInt({ min: 0n, max: 999_999_999_999n }).map(Number), 4),
    items: fc
        .uniqueArray(
            fc.tuple(fc.uuid(), fc.bigInt({ min: 1n, max: 999_999_999_999n }).map(Number)),
            { maxLength: 4, selector: ([id]) => id },
        )
        .map((items) => items.map(([id, kopecks]) => absolute(id, fromKopecks(kopecks)))),
});

const anyInputArbitrary = fc.oneof(
    { arbitrary: typicalArbitrary, weight: 2 },
    { arbitrary: toleranceArbitrary, weight: 1 },
    { arbitrary: hugeArbitrary, weight: 1 },
);

describe('генераторы попадают в границы', () => {
    it('зона допуска: большинство входов действительно гасит недостачу округления', () => {
        // Не все: при individual своя недостача участника бывает больше допуска - это перерасход
        const samples = fc.sample(toleranceArbitrary, { numRuns: 500, seed: 42 });
        const absorbed = samples.filter((input) => absorbedKopecks(input, distribute(input)) > 0n);

        expect(absorbed.length / samples.length).toBeGreaterThan(0.5);
    });

    it('обычные месяцы: есть и перерасход, и сведённые месяцы', () => {
        const samples = fc.sample(typicalArbitrary, { numRuns: 500, seed: 42 });
        const over = samples.filter((input) => isOverAllocated(distribute(input))).length;

        expect(over / samples.length).toBeGreaterThan(0.05);
        expect(over / samples.length).toBeLessThan(0.95);
    });
});

describe('distribute: свойства', () => {
    const property = (
        name: string,
        check: (input: DistributionInput, result: DistributionResult) => void,
    ) =>
        it(name, () => {
            fc.assert(
                fc.property(anyInputArbitrary, (input) => check(input, distribute(input))),
                { numRuns: NUM_RUNS },
            );
        });

    property('Σ вкладов участника + ownRemainder = plannedAmount', (input, result) => {
        for (const m of input.members) {
            const spent = sumKopecks(
                result.contributions.filter((c) => c.memberId === m.memberId).map((c) => c.amount),
            );
            const own = toKopecks(remainderOf(result, m.memberId).ownRemainder);
            expect(spent + own).toBe(toKopecks(m.plannedAmount));
        }
    });

    property('Σ settlementAmount = 0', (_, result) => {
        expect(sumKopecks(result.remainders.map((r) => r.settlementAmount))).toBe(0);
    });

    property('equalized: личные части различаются не больше чем на копейку', (input, result) => {
        if (input.personalRemainderPolicy !== 'equalized') return;

        const personal = result.remainders.map((r) => toKopecks(r.personalAmount));
        expect(Math.max(...personal) - Math.min(...personal)).toBeLessThanOrEqual(1);
    });

    property('individual: personalAmount = ownRemainder, перевода нет', (input, result) => {
        if (input.personalRemainderPolicy !== 'individual') return;

        for (const r of result.remainders) {
            expect(r.personalAmount).toBe(r.ownRemainder);
            expect(r.settlementAmount).toBe('0.00');
        }
    });

    property(
        'фиксированная категория - ровно её сумма, процентная - требование минус не больше допуска',
        (input, result) => {
            const totalPlanned = sumBig(input.members.map((m) => big(m.plannedAmount)));

            for (const item of input.items) {
                const required = requiredBySpec(item, totalPlanned);
                const paid = sumBig(
                    result.contributions
                        .filter((c) => c.categoryId === item.categoryId)
                        .map((c) => big(c.amount)),
                );

                if (item.calculationMode === 'absolute') {
                    expect(paid).toBe(required);
                } else {
                    expect(paid <= required).toBe(true);
                    expect(required - paid <= BigInt(ROUNDING_TOLERANCE_KOPECKS)).toBe(true);
                }
            }
        },
    );

    property(
        'вклад есть у каждой пары участник × категория и он неотрицателен',
        (input, result) => {
            expect(result.contributions).toHaveLength(input.members.length * input.items.length);
            for (const c of result.contributions) {
                expect(toKopecks(c.amount)).toBeGreaterThanOrEqual(0);
            }
        },
    );

    property('isOverAllocated <=> у кого-то personalAmount < 0', (_, result) => {
        expect(isOverAllocated(result)).toBe(
            result.remainders.some((r) => toKopecks(r.personalAmount) < 0),
        );
    });

    property(
        'модель: вклад и личная часть отличаются от точной доли меньше чем на копейку',
        (input, result) => {
            const weights = weightsBySpec(input);
            const weightSum = sumBig([...weights.values()]);
            const totalPlanned = sumBig(input.members.map((m) => big(m.plannedAmount)));

            for (const item of input.items) {
                const required = requiredBySpec(item, totalPlanned);
                const shares = result.contributions.filter((c) => c.categoryId === item.categoryId);

                // Процентный вклад, уменьшенный допуском, сравнивается с требованием выше
                if (sumBig(shares.map((c) => big(c.amount))) !== required) continue;

                for (const share of shares) {
                    expect(
                        isNearExactShare(
                            big(share.amount),
                            required,
                            weights.get(share.memberId)!,
                            weightSum,
                        ),
                    ).toBe(true);
                }
            }

            if (input.personalRemainderPolicy === 'equalized') {
                const pool = totalPlanned - sumBig(result.contributions.map((c) => big(c.amount)));
                const count = BigInt(input.members.length);
                for (const r of result.remainders) {
                    expect(isNearExactShare(big(r.personalAmount), pool, 1n, count)).toBe(true);
                }
            }
        },
    );
});

describe('distribute: метаморфные свойства', () => {
    it('equalized: личная часть не зависит от способа деления', () => {
        fc.assert(
            fc.property(anyInputArbitrary, (input) => {
                const personalOf = (divisionType: DistributionInput['divisionType']) =>
                    normalize(
                        distribute({
                            ...input,
                            divisionType,
                            personalRemainderPolicy: 'equalized',
                        }),
                    ).remainders.map((r) => r.personalAmount);

                expect(personalOf('in_proportion')).toEqual(personalOf('in_half'));
            }),
            { numRuns: NUM_RUNS },
        );
    });

    it('перестановка участников и категорий во входе ничего не меняет', () => {
        fc.assert(
            fc.property(
                anyInputArbitrary,
                fc.array(fc.nat(), { minLength: 6, maxLength: 6 }),
                fc.array(fc.nat(), { minLength: 6, maxLength: 6 }),
                (input, memberKeys, itemKeys) => {
                    const shuffle = <T>(list: T[], keys: number[]) =>
                        list
                            .map((value, index) => ({ value, index, key: keys[index] ?? 0 }))
                            .sort((a, b) => a.key - b.key || a.index - b.index)
                            .map(({ value }) => value);
                    const shuffled = {
                        ...input,
                        members: shuffle(input.members, memberKeys),
                        items: shuffle(input.items, itemKeys),
                    };

                    expect(normalize(distribute(shuffled))).toEqual(normalize(distribute(input)));
                },
            ),
            { numRuns: NUM_RUNS },
        );
    });

    it('категория с нулевой суммой не меняет остальные вклады и остатки', () => {
        fc.assert(
            fc.property(anyInputArbitrary, (input) => {
                fc.pre(input.items.every((item) => item.categoryId !== ZERO_CAT));

                const base = normalize(distribute(input));
                const withZero = normalize(
                    distribute({ ...input, items: [...input.items, absolute(ZERO_CAT, '0.00')] }),
                );

                expect(withZero.remainders).toEqual(base.remainders);
                expect(withZero.contributions.filter((c) => c.categoryId !== ZERO_CAT)).toEqual(
                    base.contributions,
                );
            }),
            { numRuns: NUM_RUNS },
        );
    });

    it('in_proportion: у кого план больше, тот вносит в фиксированную категорию не меньше', () => {
        // Метод наибольших остатков может дать меньшему весу лишнюю копейку - отсюда «− 1»
        fc.assert(
            fc.property(anyInputArbitrary, (input) => {
                const result = distribute({ ...input, divisionType: 'in_proportion' });

                for (const item of input.items) {
                    if (item.calculationMode !== 'absolute') continue;
                    for (const a of input.members) {
                        for (const b of input.members) {
                            if (toKopecks(a.plannedAmount) < toKopecks(b.plannedAmount)) continue;
                            const paidA = toKopecks(
                                contributionOf(result, a.memberId, item.categoryId)!,
                            );
                            const paidB = toKopecks(
                                contributionOf(result, b.memberId, item.categoryId)!,
                            );
                            expect(paidA).toBeGreaterThanOrEqual(paidB - 1);
                        }
                    }
                }
            }),
            { numRuns: NUM_RUNS },
        );
    });
});

describe('allocateReceipts: свойства', () => {
    /** Участник из случайного месяца и его транши */
    const scenarioArbitrary = fc
        .tuple(
            typicalArbitrary,
            fc.nat(),
            fc.array(fc.integer({ min: 1, max: 5_000_000 }), { minLength: 1, maxLength: 5 }),
        )
        .map(([input, pick, amounts]) => {
            const distribution = distribute(input);
            const remainder = distribution.remainders[pick % distribution.remainders.length];
            return {
                remainder,
                contributions: distribution.contributions.filter(
                    (c) => c.memberId === remainder.memberId,
                ),
                amounts,
            };
        });

    const receiptsOf = (amounts: number[]) =>
        amounts.map((amount, i) => ({ id: `r${i}`, amount: fromKopecks(amount) }));

    it('недоступна ровно при перерасходе участника', () => {
        fc.assert(
            fc.property(scenarioArbitrary, ({ remainder, contributions, amounts }) => {
                const result = allocateReceipts({
                    remainder,
                    contributions,
                    receipts: receiptsOf(amounts),
                });
                expect(result.kind === 'unavailable').toBe(toKopecks(remainder.personalAmount) < 0);
            }),
            { numRuns: NUM_RUNS },
        );
    });

    it('каждый транш делится без потерь, части неотрицательны, при дефиците личное = 0', () => {
        fc.assert(
            fc.property(scenarioArbitrary, ({ remainder, contributions, amounts }) => {
                const result = allocateReceipts({
                    remainder,
                    contributions,
                    receipts: receiptsOf(amounts),
                });
                if (result.kind === 'unavailable') return;

                result.receipts.forEach((allocation, i) => {
                    const parts = [
                        ...allocation.categories.map((c) => c.amount),
                        allocation.ownAmount,
                    ];
                    expect(sumKopecks(parts)).toBe(amounts[i]);
                    for (const part of parts) {
                        expect(toKopecks(part)).toBeGreaterThanOrEqual(0);
                    }
                    if (toKopecks(remainder.ownRemainder) < 0) {
                        expect(allocation.ownAmount).toBe('0.00');
                    }
                });
            }),
            { numRuns: NUM_RUNS },
        );
    });

    it('два транша вместо одного расходятся с ним не больше чем на копейку в каждой части', () => {
        fc.assert(
            fc.property(
                scenarioArbitrary,
                fc.integer({ min: 1, max: 5_000_000 }),
                fc.integer({ min: 1, max: 5_000_000 }),
                ({ remainder, contributions }, first, second) => {
                    const split = allocateReceipts({
                        remainder,
                        contributions,
                        receipts: receiptsOf([first, second]),
                    });
                    const whole = allocateReceipts({
                        remainder,
                        contributions,
                        receipts: receiptsOf([first + second]),
                    });
                    if (split.kind === 'unavailable' || whole.kind === 'unavailable') return;

                    const [a, b] = split.receipts;
                    const [w] = whole.receipts;
                    w.categories.forEach((category, i) => {
                        const together =
                            toKopecks(a.categories[i].amount) + toKopecks(b.categories[i].amount);
                        expect(Math.abs(together - toKopecks(category.amount))).toBeLessThanOrEqual(
                            1,
                        );
                    });
                    const ownTogether = toKopecks(a.ownAmount) + toKopecks(b.ownAmount);
                    expect(Math.abs(ownTogether - toKopecks(w.ownAmount))).toBeLessThanOrEqual(1);
                },
            ),
            { numRuns: NUM_RUNS },
        );
    });
});
