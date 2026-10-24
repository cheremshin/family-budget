import { type ReceiptBlocker, receiptBlockerMessage } from '@family-budget/domain/monthly-budget';

import { formatMoney } from '@/lib/i18n';

import type { BudgetSnapshot } from '../../model/budget.snapshot';

export type ReceiptsLockView = { message: string } | null;

export type ReceiptRow = {
    id: string;
    amount: string;
    receivedAt: string;
    isSelected: boolean;
};

export type ActualIncomesView =
    | { status: 'hidden' }
    | { status: 'ready'; rows: ReceiptRow[]; isPlanMode: boolean; lock: ReceiptsLockView };

export function receiptLockView(blocker: ReceiptBlocker | null): ReceiptsLockView {
    return blocker && { message: receiptBlockerMessage(blocker) };
}

export function buildActualIncomesView(s: BudgetSnapshot): ActualIncomesView {
    if (s.receiptBlocker === 'no-plan') return { status: 'hidden' };

    const selectedId = s.receipt?.id;

    return {
        status: 'ready',
        isPlanMode: selectedId === undefined,
        lock: receiptLockView(s.receiptBlocker),
        rows: s.member.incomeReceipts.map((receipt) => ({
            id: receipt.id,
            amount: formatMoney(receipt.amount),
            receivedAt: receipt.receivedAt,
            isSelected: receipt.id === selectedId,
        })),
    };
}
