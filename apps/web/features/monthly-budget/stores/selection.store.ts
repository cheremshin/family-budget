import { action, computed, makeObservable, observable } from 'mobx';

import { Income, MemberIncome } from '@family-budget/domain/monthly-budget';

import { Viewer } from '@/client/core';

import { BudgetStore } from './budget.store';

export class SelectionStore {
    @observable private memberId: string;
    @observable private receiptId: string | null = null;

    constructor(
        private readonly budgetStore: BudgetStore,
        private readonly viewer: Viewer,
    ) {
        this.memberId = viewer.userId;
        makeObservable(this);
    }

    @computed
    get member(): MemberIncome | undefined {
        const members = this.budgetStore.budget?.memberIncomes ?? [];
        return (
            members.find((member) => member.memberId === this.memberId) ??
            members.find((member) => member.memberId === this.viewer.userId) ??
            members[0]
        );
    }

    @computed
    get isViewingSelf(): boolean {
        return this.member?.memberId === this.viewer.userId;
    }

    @computed
    get receipt(): Income | undefined {
        if (this.receiptId === null) return undefined;

        return this.member?.incomeReceipts.find((receipt) => receipt.id === this.receiptId);
    }

    @action
    selectMember(memberId: string): void {
        this.memberId = memberId;
        this.receiptId = null;
    }

    @action
    selectReceipt(receiptId: string | null): void {
        this.receiptId = receiptId;
    }
}
