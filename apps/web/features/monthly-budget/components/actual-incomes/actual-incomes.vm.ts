import { computed, makeObservable } from 'mobx';

import type { AddIncomeInput } from '@family-budget/domain/monthly-budget';

import { type Command, type CommandResult, guarded } from '@/client/core';

import type { ReadySource, ReceiptSelection } from '../../model/ports';
import type { IncomeReceiptFormValues } from './actual-incomes.form';
import { type ActualIncomesView, buildActualIncomesView, receiptLockView } from './actual-incomes.view';

export class ActualIncomesVM {
    constructor(
        private readonly ready: ReadySource,
        private readonly selection: ReceiptSelection,
        private readonly addIncome: Command<AddIncomeInput>,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): ActualIncomesView {
        return buildActualIncomesView(this.ready.snapshot);
    }

    add = (values: IncomeReceiptFormValues): Promise<CommandResult> =>
        guarded(receiptLockView(this.ready.snapshot.receiptLock), () =>
            this.addIncome.run({ ...values, period: this.ready.period }),
        );

    select = (receiptId: string): void => this.selection.selectReceipt(receiptId);
    clearSelection = (): void => this.selection.selectReceipt(null);
}
