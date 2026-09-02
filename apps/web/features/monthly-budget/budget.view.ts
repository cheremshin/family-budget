import z from 'zod';

import {
    MemberIncome,
    MonthlyBudget,
    incomeFieldsSchema,
} from '@family-budget/domain/monthly-budget';
import { Period, fromKopecks, toKopecks } from '@family-budget/domain/shared';

import { formatMoney } from '@/lib/i18n';

export type IncomeFields = z.infer<typeof incomeFieldsSchema>;

export type ReceiptRow = {
    id: string;
    receivedAt: string;
    amount: string;
};

export type PlannedIncomeView = {
    kind: 'planned';
    plannedAmount: string;
    received: string;
    remaining: string;
    progress: number;
    receipts: ReceiptRow[];
    addIncome: (input: IncomeFields) => Promise<unknown>;
};

/** открытый месяц, плановый доход еще не задан */
export type NoPlanView = {
    kind: 'no-plan';
    setPlan: (amount: string) => Promise<unknown>;
};

export type UserIncomeView =
    | PlannedIncomeView
    | NoPlanView
    /** закрытый месяц, в котором участник не состоял */
    | { kind: 'absent' };

export type BudgetActions = {
    setPlan: (amount: string) => Promise<unknown>;
    addIncome: (input: IncomeFields) => Promise<unknown>;
};

export type MemberRow = {
    memberId: string;
    name: string;
    plannedAmount: string | null;
    isCurrentUser: boolean;
};

export type BudgetView =
    | { kind: 'loading' }
    | { kind: 'open'; userIncome: UserIncomeView; members: MemberRow[] }
    | {
          kind: 'closed';
          userIncome: UserIncomeView;
          members: MemberRow[];
          personalRemainder: string | null;
      };

export function toBudgetView(
    budget: MonthlyBudget | undefined,
    selectedPeriod: Period,
    currentUserId: string,
    actions: BudgetActions,
): BudgetView {
    if (!budget || budget.period !== selectedPeriod) {
        return { kind: 'loading' };
    }

    const members = budget.memberIncomes.map((member) => toMemberRow(member, currentUserId));
    const userIncome = toUserIncomeView(
        budget.memberIncomes.find((member) => member.memberId === currentUserId),
        actions,
    );

    if (!budget.isClosed) {
        return { kind: 'open', userIncome, members };
    }

    const personal = budget.personalRemainders.find(
        (remainder) => remainder.memberId === currentUserId,
    );
    return {
        kind: 'closed',
        userIncome,
        members,
        personalRemainder: personal ? formatMoney(personal.amount) : null,
    };
}

function toUserIncomeView(
    member: MemberIncome | undefined,
    actions: BudgetActions,
): UserIncomeView {
    if (!member) return { kind: 'absent' };
    if (member.plannedAmount === null) return { kind: 'no-plan', setPlan: actions.setPlan };

    const planned = toKopecks(member.plannedAmount);
    const received = member.incomeReceipts.reduce(
        (acc, receipt) => acc + toKopecks(receipt.amount),
        0,
    );

    return {
        kind: 'planned',
        plannedAmount: formatMoney(member.plannedAmount),
        received: formatMoney(fromKopecks(received)),
        remaining: formatMoney(fromKopecks(planned - received)),
        progress: planned === 0 ? 100 : Math.min(100, (received / planned) * 100),
        receipts: member.incomeReceipts.map((receipt) => ({
            id: receipt.id,
            receivedAt: receipt.receivedAt,
            amount: formatMoney(receipt.amount),
        })),
        addIncome: actions.addIncome,
    };
}

function toMemberRow(member: MemberIncome, currentUserId: string): MemberRow {
    return {
        memberId: member.memberId,
        name: member.memberName,
        plannedAmount: member.plannedAmount === null ? null : formatMoney(member.plannedAmount),
        isCurrentUser: member.memberId === currentUserId,
    };
}
