import { CalculationMode } from '../budget-category';
import { BudgetDivisionType, PersonalRemainderPolicy } from '../family';
import {
    Money,
    SignedMoney,
    allocate,
    fromKopecks,
    percentOf,
    sumMoney,
    toKopecks,
} from '../shared/money';
import { Contribution } from './monthly-budget.contract';

export type DistributionItem = {
    categoryId: string;
    calculationMode: CalculationMode;
    targetAmount: Money;
};

export type DistributionMember = {
    memberId: string;
    plannedAmount: Money;
};

export type DistributionInput = {
    divisionType: BudgetDivisionType;
    personalRemainderPolicy: PersonalRemainderPolicy;
    items: DistributionItem[];
    members: DistributionMember[];
};

export type MemberRemainder = {
    memberId: string;
    /** plannedAmount − сумма вкладов участника по категориям, без учета политики */
    ownRemainder: SignedMoney;
    /** то, что участник в итоге оставляет себе - с учетом политики */
    personalAmount: SignedMoney;
    /** ownRemainder − personalAmount: положительное - вносит в пул, отрицательное - получает */
    settlementAmount: SignedMoney;
};

export type DistributionResult = {
    contributions: Contribution[];
    remainders: MemberRemainder[];
};

/**
 * Расчет, кто сколько вкладывает в каждую категорию и сколько остается на личные расходы
 *
 * Сервер должен вызывать эту функцию при закрытии месяца, а клиент для предпросмотра
 */
export function distribute({
    divisionType,
    personalRemainderPolicy,
    items,
    members,
}: DistributionInput): DistributionResult {
    if (members.length === 0) {
        return { contributions: [], remainders: [] };
    }

    const orderedMembers = [...members].sort((a, b) => a.memberId.localeCompare(b.memberId));
    const totalPlanned = sumMoney(orderedMembers.map((member) => member.plannedAmount));
    const proportional = orderedMembers.map((member) => toKopecks(member.plannedAmount));

    const weights =
        divisionType === 'in_half' || proportional.every((weight) => weight === 0)
            ? orderedMembers.map(() => 1)
            : proportional;

    const contributions: Contribution[] = [];
    const spentByMember = new Map(orderedMembers.map((member) => [member.memberId, 0]));

    for (const item of items) {
        const required =
            item.calculationMode === 'absolute'
                ? item.targetAmount
                : percentOf(totalPlanned, item.targetAmount);

        allocate(required, weights).forEach((amount, index) => {
            const { memberId } = orderedMembers[index];
            contributions.push({ memberId, categoryId: item.categoryId, amount });
            spentByMember.set(memberId, spentByMember.get(memberId)! + toKopecks(amount));
        });
    }

    const ownRemainders = orderedMembers.map((member) => ({
        memberId: member.memberId,
        ownRemainder: fromKopecks(
            toKopecks(member.plannedAmount) - spentByMember.get(member.memberId)!,
        ),
    }));

    const personalAmounts = resolvePersonalAmounts(personalRemainderPolicy, ownRemainders);

    const remainders: MemberRemainder[] = ownRemainders.map(({ memberId, ownRemainder }) => {
        const personalAmount = personalAmounts.get(memberId)!;
        return {
            memberId,
            ownRemainder,
            personalAmount,
            settlementAmount: fromKopecks(toKopecks(ownRemainder) - toKopecks(personalAmount)),
        };
    });

    return { contributions, remainders };
}

/**
 * `individual` — каждый оставляет себе свой сырой остаток
 * `equalized` — остатки складываются в общий пул и делятся поровну (методом наибольших остатков)
 */
function resolvePersonalAmounts(
    policy: PersonalRemainderPolicy,
    ownRemainders: Array<{ memberId: string; ownRemainder: SignedMoney }>,
): Map<string, SignedMoney> {
    if (policy === 'individual') {
        return new Map(ownRemainders.map(({ memberId, ownRemainder }) => [memberId, ownRemainder]));
    }

    const pooled = sumMoney(ownRemainders.map(({ ownRemainder }) => ownRemainder));
    const equalWeights = ownRemainders.map(() => 1);
    const shares = allocate(pooled, equalWeights);

    return new Map(ownRemainders.map(({ memberId }, index) => [memberId, shares[index]]));
}

export function isOverAllocated(result: DistributionResult): boolean {
    return result.remainders.some((remainder) => toKopecks(remainder.personalAmount) < 0);
}

export type ReceiptAllocationInput = {
    remainder: MemberRemainder;
    /** Вклады только этого участника */
    contributions: Array<{ categoryId: string; amount: Money }>;
    receipts: Array<{ id: string; amount: Money }>;
};

export type ReceiptAllocation = {
    receiptId: string;
    categories: Array<{ categoryId: string; amount: Money }>;
    /** Личная часть из собственных денег: доля ownRemainder, трансфер сюда не входит */
    ownAmount: Money;
};

export type ReceiptAllocationResult =
    | { kind: 'unavailable'; reason: 'over-allocated' }
    | { kind: 'allocated'; receipts: ReceiptAllocation[] };

/**
 * Разбивка поступления: сколько из своих денег уходит в каждую категорию и сколько
 * остается лично
 *
 * Веса — `Σ вкладов + ownRemainder`, что в точности равно плановому доходу участника,
 * поэтому по мере поступления доходов суммы сходятся к обязательствам. Каждый чек делится
 * независимо, так что внутри чека сумма частей точная, а по нескольким траншам итог может
 * разойтись с обязательством на копейку.
 *
 * Трансфер по политике (`settlementAmount`) в разбивку не входит: он известен, как только
 * заданы планы, и от уже полученного не зависит.
 *
 * `ownRemainder < 0` — своих денег не хватает даже на собственную долю категорий: личный
 * вес зажимается в ноль, весь чек расходится по категориям, недостачу закрывает трансфер.
 */
export function allocateReceipts({
    remainder,
    contributions,
    receipts,
}: ReceiptAllocationInput): ReceiptAllocationResult {
    // Тот же гвард, что у закрытия месяца: политика не свела концы — разбивку не строим
    if (toKopecks(remainder.personalAmount) < 0) {
        return { kind: 'unavailable', reason: 'over-allocated' };
    }

    const weights = [
        ...contributions.map((contribution) => toKopecks(contribution.amount)),
        Math.max(toKopecks(remainder.ownRemainder), 0),
    ];

    if (weights.every((weight) => weight === 0)) {
        return {
            kind: 'allocated',
            receipts: receipts.map((receipt) => ({
                receiptId: receipt.id,
                categories: contributions.map((contribution) => ({
                    categoryId: contribution.categoryId,
                    amount: fromKopecks(0),
                })),
                ownAmount: receipt.amount,
            })),
        };
    }

    return {
        kind: 'allocated',
        receipts: receipts.map((receipt) => {
            const parts = allocate(receipt.amount, weights);

            return {
                receiptId: receipt.id,
                categories: contributions.map((contribution, index) => ({
                    categoryId: contribution.categoryId,
                    amount: parts[index],
                })),
                // Личная часть - последний вес, дописанный к вкладам
                ownAmount: parts[parts.length - 1],
            };
        }),
    };
}
