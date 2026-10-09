import { formatMoney } from '@/lib/i18n';

import type { BudgetSnapshot } from '../../model/budget.snapshot';
import type { ReceiptLock } from '../../model/locks';

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


const FOREIGN_MESSAGE = 'Добавить поступление может только его получатель';

export function receiptLockView(lock: ReceiptLock | null): ReceiptsLockView {
    return lock && { message: FOREIGN_MESSAGE };
}

export function buildActualIncomesView(s: BudgetSnapshot): ActualIncomesView {
    if (s.member.plannedAmount === null) return { status: 'hidden' };

    const selectedId = s.receipt?.id;

    return {
        status: 'ready',
        isPlanMode: selectedId === undefined,
        lock: receiptLockView(s.receiptLock),
        rows: s.member.incomeReceipts.map((receipt) => ({
            id: receipt.id,
            amount: formatMoney(receipt.amount),
            receivedAt: receipt.receivedAt,
            isSelected: receipt.id === selectedId,
        })),
    };
}
