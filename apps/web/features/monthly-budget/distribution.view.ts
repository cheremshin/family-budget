import { BudgetCategoryType } from '@family-budget/domain/budget-category';
import {
    Contribution,
    MonthlyBudget,
    MonthlyBudgetItem,
    distribute,
} from '@family-budget/domain/monthly-budget';
import { Period, fromKopecks, sumMoney, toKopecks } from '@family-budget/domain/shared';

import { categoryTypeLabels, formatMoney, formatPercent } from '@/lib/i18n';

export type CategoryTarget = {
    categoryId: string;
    name: string;
    type: BudgetCategoryType;
    /** Как категория настроена: «12 000,00 ₽» для absolute, «20 %» для relative */
    target: string;
    /**
     * У процентных категорий сумма выводится из общего дохода, поэтому правило стоит
     * показать рядом. У фиксированных оно совпало бы с итогом — объяснять нечего.
     */
    isRelative: boolean;
};

export type CategoryShare = {
    memberId: string;
    memberName: string;
    amount: string;
    /** Доля участника внутри категории, 0..100 — ширина сегмента полосы */
    weight: number;
    isMe: boolean;
    colorIndex: number;
};

export type CategoryRow = CategoryTarget & {
    required: string;
    /** Вес категории в общем распределении, 0..100 — заполненность полосы */
    weight: number;
    shares: CategoryShare[];
};

export type CategoryGroup = {
    type: BudgetCategoryType;
    label: string;
    total: string;
    categories: CategoryRow[];
};

export type PersonalRow = {
    memberId: string;
    memberName: string;
    amount: string;
    isMe: boolean;
    isNegative: boolean;
};

export type DistributionView =
    | { kind: 'loading' }
    /** Пока все не установили план, показываются только цели */
    | { kind: 'awaiting-plans'; awaiting: string[]; targets: CategoryTarget[] }
    | {
          kind: 'ready';
          /** false — предпросмотр по текущим данным, true — зафиксировано закрытием */
          isFinal: boolean;
          /** Участников больше одного — есть смысл показывать разбивку по людям */
          hasMultipleMembers: boolean;
          groups: CategoryGroup[];
          personal: PersonalRow[];
          total: string;
          /** Кто-то в минусе — закрыть месяц нельзя */
          isOverAllocated: boolean;
      };

export type AwaitingPlans = Extract<DistributionView, { kind: 'awaiting-plans' }>;
export type ReadyDistribution = Extract<DistributionView, { kind: 'ready' }>;

export function toDistributionView(
    budget: MonthlyBudget | undefined,
    selectedPeriod: Period,
    currentUserId: string,
): DistributionView {
    if (!budget || budget.period !== selectedPeriod) {
        return { kind: 'loading' };
    }

    if (budget.isClosed) {
        return toReady(budget, budget.contributions, budget.personalRemainders, currentUserId, true);
    }

    const awaiting = budget.memberIncomes.filter((member) => member.plannedAmount === null);

    if (awaiting.length > 0) {
        return {
            kind: 'awaiting-plans',
            awaiting: awaiting.map((member) => member.memberName),
            targets: budget.items.map(toCategoryTarget),
        };
    }

    const result = distribute({
        divisionType: budget.divisionType,
        items: budget.items,
        members: budget.memberIncomes.map((member) => ({
            memberId: member.memberId,
            plannedAmount: member.plannedAmount!,
        })),
    });

    return toReady(budget, result.contributions, result.personalRemainders, currentUserId, false);
}

function toReady(
    budget: MonthlyBudget,
    contributions: Contribution[],
    remainders: Array<{ memberId: string; amount: string }>,
    currentUserId: string,
    isFinal: boolean,
): DistributionView {
    const memberMeta = new Map(
        budget.memberIncomes.map((member, index) => [
            member.memberId,
            { name: member.memberName, colorIndex: index },
        ]),
    );

    const byCategory = new Map<string, Contribution[]>();
    for (const contribution of contributions) {
        const bucket = byCategory.get(contribution.categoryId) ?? [];
        bucket.push(contribution);
        byCategory.set(contribution.categoryId, bucket);
    }

    const totalKopecks = contributions.reduce((acc, c) => acc + toKopecks(c.amount), 0);

    const categories = budget.items.map((item) => {
        const own = byCategory.get(item.categoryId) ?? [];
        const requiredKopecks = own.reduce((acc, c) => acc + toKopecks(c.amount), 0);

        const row: CategoryRow = {
            ...toCategoryTarget(item),
            required: formatMoney(fromKopecks(requiredKopecks)),
            weight: share(requiredKopecks, totalKopecks),
            shares: own.map((contribution) => {
                const meta = memberMeta.get(contribution.memberId);

                return {
                    memberId: contribution.memberId,
                    memberName: meta?.name ?? '',
                    amount: formatMoney(contribution.amount),
                    weight: share(toKopecks(contribution.amount), requiredKopecks),
                    isMe: contribution.memberId === currentUserId,
                    colorIndex: meta?.colorIndex ?? 0,
                };
            }),
        };

        // Сырые копейки нужны для итога по группе: складывать отформатированные строки нельзя
        return { row, requiredKopecks, type: item.categoryType };
    });

    const personal = remainders.map((remainder) => ({
        memberId: remainder.memberId,
        memberName: memberMeta.get(remainder.memberId)?.name ?? '',
        amount: formatMoney(remainder.amount),
        isMe: remainder.memberId === currentUserId,
        isNegative: toKopecks(remainder.amount) < 0,
    }));

    return {
        kind: 'ready',
        isFinal,
        hasMultipleMembers: budget.memberIncomes.length > 1,
        groups: toGroups(categories),
        personal,
        total: formatMoney(sumMoney(contributions.map((c) => c.amount))),
        isOverAllocated: personal.some((row) => row.isNegative),
    };
}

type CategoryEntry = { row: CategoryRow; requiredKopecks: number; type: BudgetCategoryType };

/**
 * Расходы и накопления разнесены по секциям, а не помечены плашкой в строке:
 * так итог по каждому типу виден сразу и не смешивается с самими категориями.
 */
function toGroups(entries: CategoryEntry[]): CategoryGroup[] {
    return (['expense', 'savings'] as const)
        .map((type) => {
            const own = entries.filter((entry) => entry.type === type);

            return {
                type,
                label: categoryTypeLabels[type],
                total: formatMoney(
                    fromKopecks(own.reduce((acc, entry) => acc + entry.requiredKopecks, 0)),
                ),
                categories: own.map((entry) => entry.row),
            };
        })
        .filter((group) => group.categories.length > 0);
}

function toCategoryTarget(item: MonthlyBudgetItem): CategoryTarget {
    const isRelative = item.calculationMode === 'relative';

    return {
        categoryId: item.categoryId,
        name: item.categoryName,
        type: item.categoryType,
        target: isRelative ? formatPercent(item.targetAmount) : formatMoney(item.targetAmount),
        isRelative,
    };
}

function share(part: number, whole: number): number {
    return whole === 0 ? 0 : (part / whole) * 100;
}
