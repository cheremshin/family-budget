import { describe, expect, it } from 'vitest';

import type { Actor, BudgetDivisionType, PersonalRemainderPolicy } from '../family';
import { distributionOf } from './monthly-budget.calculation';
import type {
    ClosedMonthlyBudget,
    MonthlyBudget,
    OpenMonthlyBudget,
} from './monthly-budget.contract';
import { closeBlockerOf, planBlockerOf, receiptBlockerOf } from './monthly-budget.rules';

const ANYA = '00000000-0000-4000-8000-000000000001';
const BORIS = '00000000-0000-4000-8000-000000000002';
const CATEGORY = '00000000-0000-4000-8000-000000000200';

const anya: Actor = { memberId: ANYA, isOwner: true };
const boris: Actor = { memberId: BORIS, isOwner: false };

type MonthSpec = {
    anya: string | null;
    boris: string | null;
    fixed: string[];
    divisionType?: BudgetDivisionType;
    policy?: PersonalRemainderPolicy;
};

function openMonth({
    anya,
    boris,
    fixed,
    divisionType = 'in_half',
    policy = 'equalized',
}: MonthSpec): OpenMonthlyBudget {
    return {
        id: '00000000-0000-4000-8000-000000000100',
        period: '2026-08-01',
        version: 1,
        isClosed: false,
        divisionType,
        personalRemainderPolicy: policy,
        items: fixed.map((targetAmount, index) => ({
            categoryId: `00000000-0000-4000-8000-00000000020${index}`,
            categoryName: `Категория ${index + 1}`,
            categoryType: 'expense',
            calculationMode: 'absolute',
            targetAmount,
            sortOrder: index,
        })),
        memberIncomes: [
            { memberId: ANYA, memberName: 'Аня', plannedAmount: anya, incomeReceipts: [] },
            { memberId: BORIS, memberName: 'Борис', plannedAmount: boris, incomeReceipts: [] },
        ],
    };
}

// Как экран и закрытие: правило получает распределение того же месяца
const blockerOf = (month: MonthlyBudget, actor: Actor) =>
    closeBlockerOf(month, actor, distributionOf(month));

function closedMonth(): ClosedMonthlyBudget {
    return {
        ...openMonth({ anya: '100.00', boris: '50.00', fixed: ['150.00'] }),
        isClosed: true,
        memberIncomes: [
            { memberId: ANYA, memberName: 'Аня', plannedAmount: '100.00', incomeReceipts: [] },
            { memberId: BORIS, memberName: 'Борис', plannedAmount: '50.00', incomeReceipts: [] },
        ],
        contributions: [],
        remainders: [],
    };
}

describe('closeBlockerOf: примеры из rules.md', () => {
    it('З1 — не владелец не закрывает даже готовый месяц', () => {
        const month = openMonth({ anya: '100.00', boris: '50.00', fixed: ['150.00'] });
        expect(blockerOf(month, boris)).toBe('not-owner');
    });

    it('З2 — закрытый месяц второй раз не закрывается', () => {
        expect(blockerOf(closedMonth(), anya)).toBe('closed');
    });

    it('З3 — у Бориса нет плана', () => {
        const month = openMonth({ anya: '100.00', boris: null, fixed: ['50.00'] });
        expect(blockerOf(month, anya)).toBe('plan-incomplete');
    });

    it('З4 — нулевой план — это план', () => {
        const month = openMonth({
            anya: '100.00',
            boris: '0.00',
            fixed: ['100.00'],
            divisionType: 'in_proportion',
        });
        expect(blockerOf(month, anya)).toBeNull();
    });

    it('З5 — планы есть, категорий нет', () => {
        const month = openMonth({ anya: '100.00', boris: '50.00', fixed: [] });
        expect(blockerOf(month, anya)).toBe('no-categories');
    });

    it('З6 — категории требуют 200, планы дают 150', () => {
        const month = openMonth({ anya: '100.00', boris: '50.00', fixed: ['200.00'] });
        expect(blockerOf(month, anya)).toBe('over-allocated');
    });

    it('З7 — категории требуют ровно 150 из 150', () => {
        const month = openMonth({ anya: '100.00', boris: '50.00', fixed: ['150.00'] });
        expect(blockerOf(month, anya)).toBeNull();
    });

    it('З8 — individual: семье хватает, а Борису на его половину — нет', () => {
        const month = openMonth({
            anya: '100.00',
            boris: '50.00',
            fixed: ['150.00'],
            policy: 'individual',
        });
        expect(blockerOf(month, anya)).toBe('over-allocated');
    });

    it('З9 — individual, пропорционально: каждый вносит по силам', () => {
        const month = openMonth({
            anya: '100.00',
            boris: '50.00',
            fixed: ['150.00'],
            divisionType: 'in_proportion',
            policy: 'individual',
        });
        expect(blockerOf(month, anya)).toBeNull();
    });

    it('З13 — закрытие сохраняет то распределение, что показывал предпросмотр', () => {
        const month = openMonth({ anya: '100.00', boris: '50.00', fixed: ['150.00'] });

        expect(distributionOf(month)).toMatchObject({
            isOverAllocated: false,
            remainders: [
                {
                    memberId: ANYA,
                    ownRemainder: '25.00',
                    personalAmount: '0.00',
                    settlementAmount: '25.00',
                },
                {
                    memberId: BORIS,
                    ownRemainder: '-25.00',
                    personalAmount: '0.00',
                    settlementAmount: '-25.00',
                },
            ],
        });
    });
});

describe('distributionOf: примеры из rules.md', () => {
    it('З14 — закрытый месяц показывает сохранённый итог, а не пересчёт', () => {
        const stored = {
            contributions: [{ memberId: ANYA, categoryId: CATEGORY, amount: '120.00' }],
            remainders: [
                {
                    memberId: ANYA,
                    ownRemainder: '-20.00',
                    personalAmount: '0.00',
                    settlementAmount: '-20.00',
                },
                {
                    memberId: BORIS,
                    ownRemainder: '20.00',
                    personalAmount: '0.00',
                    settlementAmount: '20.00',
                },
            ],
        };

        expect(distributionOf({ ...closedMonth(), ...stored })).toEqual({
            ...stored,
            isOverAllocated: false,
        });
    });
});

describe('planBlockerOf и receiptBlockerOf: примеры из rules.md', () => {
    const month = openMonth({ anya: '100.00', boris: '50.00', fixed: ['150.00'] });

    it('З10 — свой план в открытом месяце менять можно, чужой нельзя', () => {
        expect(planBlockerOf(month, anya, ANYA)).toBeNull();
        expect(planBlockerOf(month, anya, BORIS)).toBe('foreign');
    });

    it('З11 — в закрытом месяце план не меняется, а поступление себе записать можно', () => {
        expect(planBlockerOf(closedMonth(), anya, ANYA)).toBe('closed');
        expect(receiptBlockerOf(closedMonth(), anya, ANYA)).toBeNull();
        expect(receiptBlockerOf(closedMonth(), anya, BORIS)).toBe('foreign');
    });

    it('З12 — поступление записывается только после плана', () => {
        const month = openMonth({ anya: '100.00', boris: null, fixed: ['50.00'] });
        expect(receiptBlockerOf(month, boris, BORIS)).toBe('no-plan');
        expect(receiptBlockerOf(month, anya, BORIS)).toBe('no-plan');
        expect(receiptBlockerOf(month, anya, ANYA)).toBeNull();
    });
});
