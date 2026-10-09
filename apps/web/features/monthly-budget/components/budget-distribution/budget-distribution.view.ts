import type { PersonalRemainderPolicy } from '@family-budget/domain/family';
import {
    type DistributionResult,
    type Income,
    type MonthlyBudgetItem,
    isOverAllocated,
} from '@family-budget/domain/monthly-budget';
import {
    type Money,
    type SignedMoney,
    fromKopecks,
    sumMoney,
    toKopecks,
} from '@family-budget/domain/shared';

import { formatDate, formatMoney, formatPercent } from '@/lib/i18n';

import type { BudgetSnapshot } from '../../model/budget.snapshot';
import { memberShareOf, plannedMembersOf } from '../../model/distribution';

/** Колонка матрицы - участник. */
export type DistributionColumn = {
    memberId: string;
    memberName: string;
    isViewer: boolean;
};

export type DistributionCell = {
    column: DistributionColumn;
    amount: string;
};

export type DistributionRowKind = 'savings' | 'expense' | 'personal';

export type DistributionRow = {
    id: string;
    kind: DistributionRowKind;
    name: string;
    hint: string;
    cells: DistributionCell[];
};

export type SettlementView = {
    debtorName: string;
    creditorName: string;
    amount: string;
    isViewerDebtor: boolean;
} | null;

export type SelectedReceipt = {
    receiptId: string;
    amount: string;
    receivedAt: string;
};

export type BudgetDistributionView =
    | { status: 'hidden' }
    | { status: 'empty'; message: string }
    | {
          status: 'month';
          isPreview: boolean;
          columns: DistributionColumn[];
          rows: DistributionRow[];
          settlement: SettlementView;
      }
    | {
          status: 'receipt';
          receipt: SelectedReceipt;
          isPreview: boolean;
          columns: [DistributionColumn];
          rows: DistributionRow[];
      };

const ZERO: Money = '0.00';

const NO_CATEGORIES = 'Категорий пока нет - распределять некуда';
const OVER_ALLOCATED = 'Планов не хватает на обязательные категории';
const NO_ALLOCATION = 'Это поступление не удалось разложить';

const POLICY_HINT = {
    individual: 'каждому свой остаток',
    equalized: 'делится поровну',
} satisfies Record<PersonalRemainderPolicy, string>;

type RowInput = {
    id: string;
    kind: DistributionRowKind;
    name: string;
    hint: string;
    columns: DistributionColumn[];
    amountOf: (column: DistributionColumn) => SignedMoney;
};

export function buildBudgetDistributionView(s: BudgetSnapshot): BudgetDistributionView {
    const columns = columnsOf(s);

    if (columns.length === 0) return { status: 'hidden' };
    if (s.budget.items.length === 0) return { status: 'empty', message: NO_CATEGORIES };
    if (!s.distribution) return { status: 'hidden' };
    if (isOverAllocated(s.distribution)) return { status: 'empty', message: OVER_ALLOCATED };

    return s.receipt
        ? receiptView(s, s.distribution, s.receipt, columns)
        : monthView(s, s.distribution, columns);
}

function columnsOf(s: BudgetSnapshot): DistributionColumn[] {
    return plannedMembersOf(s.budget).map((member) => ({
        memberId: member.memberId,
        memberName: member.memberName,
        isViewer: member.memberId === s.viewer.userId,
    }));
}

function monthView(
    s: BudgetSnapshot,
    distribution: DistributionResult,
    columns: DistributionColumn[],
): BudgetDistributionView {
    const contributions = new Map(
        distribution.contributions.map((item) => [`${item.memberId}:${item.categoryId}`, item.amount]),
    );
    const personal = new Map(
        distribution.remainders.map((item) => [item.memberId, item.personalAmount]),
    );
    const amountIn = (column: DistributionColumn, categoryId: string): SignedMoney =>
        contributions.get(`${column.memberId}:${categoryId}`) ?? ZERO;

    const rows: DistributionRow[] = [
        ...s.budget.items.map((item) =>
            row({
                id: item.categoryId,
                kind: item.categoryType,
                name: item.categoryName,
                hint: `${formatMoney(sumMoney(columns.map((column) => amountIn(column, item.categoryId))))} · ${modeHint(item)}`,
                columns,
                amountOf: (column) => amountIn(column, item.categoryId),
            }),
        ),
        row({
            id: 'personal',
            kind: 'personal',
            name: 'Остаток на личные расходы',
            hint: `${formatMoney(sumMoney(columns.map((column) => personal.get(column.memberId) ?? ZERO)))} · ${POLICY_HINT[s.budget.personalRemainderPolicy]}`,
            columns,
            amountOf: (column) => personal.get(column.memberId) ?? ZERO,
        }),
    ];

    return {
        status: 'month',
        isPreview: !s.budget.isClosed,
        columns,
        rows,
        settlement: settlementOf(distribution, columns),
    };
}

function receiptView(
    s: BudgetSnapshot,
    distribution: DistributionResult,
    receipt: Income,
    columns: DistributionColumn[],
): BudgetDistributionView {
    const column = columns.find((candidate) => candidate.memberId === s.member.memberId);
    const share = memberShareOf(distribution, s.member);
    if (!column || !share) return { status: 'hidden' };

    if (share.allocation.kind === 'unavailable') return { status: 'empty', message: OVER_ALLOCATED };

    const allocation = share.allocation.receipts.find((item) => item.receiptId === receipt.id);
    if (!allocation) return { status: 'empty', message: NO_ALLOCATION };

    const inReceipt = new Map(allocation.categories.map((item) => [item.categoryId, item.amount]));
    const inMonth = new Map(share.contributions.map((item) => [item.categoryId, item.amount]));
    const single: [DistributionColumn] = [column];

    const rows: DistributionRow[] = [
        ...s.budget.items.map((item) =>
            row({
                id: item.categoryId,
                kind: item.categoryType,
                name: item.categoryName,
                hint: `из ${formatMoney(inMonth.get(item.categoryId) ?? ZERO)} за месяц`,
                columns: single,
                amountOf: () => inReceipt.get(item.categoryId) ?? ZERO,
            }),
        ),
        row({
            id: 'personal',
            kind: 'personal',
            name: 'Остаётся с этого поступления',
            hint: `из ${formatMoney(share.remainder.ownRemainder)} своих за месяц`,
            columns: single,
            amountOf: () => allocation.ownAmount,
        }),
    ];

    return {
        status: 'receipt',
        receipt: {
            receiptId: receipt.id,
            amount: formatMoney(receipt.amount),
            receivedAt: formatDate(receipt.receivedAt),
        },
        isPreview: !s.budget.isClosed,
        columns: single,
        rows,
    };
}

function row({ id, kind, name, hint, columns, amountOf }: RowInput): DistributionRow {
    return {
        id,
        kind,
        name,
        hint,
        cells: columns.map((column) => ({ column, amount: formatMoney(amountOf(column)) })),
    };
}

function modeHint(item: MonthlyBudgetItem): string {
    return item.calculationMode === 'relative'
        ? `${formatPercent(item.targetAmount)} от дохода`
        : 'фиксированная сумма';
}

function settlementOf(distribution: DistributionResult, columns: DistributionColumn[]): SettlementView {
    const debtor = distribution.remainders.find((item) => toKopecks(item.settlementAmount) > 0);
    const creditor = distribution.remainders.find((item) => toKopecks(item.settlementAmount) < 0);
    if (!debtor || !creditor) return null;

    const debtorColumn = columns.find((column) => column.memberId === debtor.memberId);
    const creditorColumn = columns.find((column) => column.memberId === creditor.memberId);
    if (!debtorColumn || !creditorColumn) return null;

    return {
        debtorName: debtorColumn.memberName,
        creditorName: creditorColumn.memberName,
        amount: formatMoney(fromKopecks(Math.abs(toKopecks(debtor.settlementAmount)))),
        isViewerDebtor: debtorColumn.isViewer,
    };
}
