import { CalculationMode } from '../budget-category';
import { BudgetDivisionType } from '../family';
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
    items: DistributionItem[];
    members: DistributionMember[];
};

export type DistributionResult = {
    contributions: Contribution[];
    personalRemainders: Array<{ memberId: string; amount: SignedMoney }>;
};

/**
 * Расчет, кто сколько вкладывает в каждую категорию и сколько остается на личные расходы
 *
 * Сервер должен вызывать эту функцию при закрытии месяца, а клиент для предпросмотра
 */
export function distribute({
    divisionType,
    items,
    members,
}: DistributionInput): DistributionResult {
    if (members.length === 0) {
        return { contributions: [], personalRemainders: [] };
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

    const personalRemainders = orderedMembers.map((member) => ({
        memberId: member.memberId,
        amount: fromKopecks(toKopecks(member.plannedAmount) - spentByMember.get(member.memberId)!),
    }));

    return { contributions, personalRemainders };
}

export function hasOverAllocation(result: DistributionResult): boolean {
    return result.personalRemainders.some((remainder) => toKopecks(remainder.amount) < 0);
}
