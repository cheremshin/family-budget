import { computed, makeObservable } from 'mobx';

import { ClientError, CommandResult } from '@/client/core';
import { AddIncomeCommand } from '@/client/monthly-budget';
import { formatMoney } from '@/lib/i18n';

import { BudgetStore } from '../../stores/budget.store';
import { SelectionStore } from '../../stores/selection.store';
import { IncomeReceiptFormValues } from './actual-incomes.form';
import { ReceiptsView } from './actual-incomes.view';

const FOREIGN_MESSAGE = 'Добавить поступление может только его получатель';

export class ReceiptsStore {
    constructor(
        private readonly budgetStore: BudgetStore,
        private readonly selectionStore: SelectionStore,
        private readonly addIncome: AddIncomeCommand,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): ReceiptsView {
        const budget = this.budgetStore.budget;
        const member = this.selectionStore.member;
        if (!budget || !member) return { status: 'loading' };

        if (member.plannedAmount === null) return { status: 'hidden' };

        const selectedId = this.selectionStore.receipt?.id;

        return {
            status: 'ready',
            isPlanMode: selectedId === undefined,
            lock: this.selectionStore.isViewingSelf ? null : { message: FOREIGN_MESSAGE },
            rows: member.incomeReceipts.map((receipt) => ({
                id: receipt.id,
                amount: formatMoney(receipt.amount),
                receivedAt: receipt.receivedAt,
                isSelected: receipt.id === selectedId,
            })),
        };
    }

    add = (values: IncomeReceiptFormValues): Promise<CommandResult> => {
        const budget = this.budgetStore.budget;

        if (!budget) {
            return Promise.resolve({
                ok: false,
                error: new ClientError('unexpected', 'Бюджет еще загружается'),
            });
        }

        if (!this.selectionStore.isViewingSelf) {
            return Promise.resolve({
                ok: false,
                error: new ClientError('domain', FOREIGN_MESSAGE),
            });
        }

        return this.addIncome.run({ ...values, period: budget.period });
    };

    select = (receiptId: string) => this.selectionStore.selectReceipt(receiptId);
    clearSelection = (): void => this.selectionStore.selectReceipt(null);
}
