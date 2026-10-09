import { action, computed, makeObservable, observable } from 'mobx';

import type { Period } from '@family-budget/domain/shared';

import type { Viewer } from '@/client/core';

import { type BudgetSnapshot, toBudgetSnapshot } from './budget.snapshot';
import type { BudgetSource, MemberSelection, PeriodSource, ReceiptSelection } from './ports';
import { MonthlyBudget } from '@family-budget/domain/monthly-budget';

export type BudgetState =
    | { kind: 'loading' }
    | { kind: 'error'; message: string; canRetry: boolean }
    | { kind: 'absent'; period: Period; isPast: boolean }
    | { kind: 'ready'; snapshot: BudgetSnapshot; syncError: string | null };

export class BudgetModel implements MemberSelection, ReceiptSelection {
    private readonly source: BudgetSource;
    private readonly period: PeriodSource;
    private readonly viewer: Viewer;

    @observable private memberId: string;

    /** При смене периода выбор транша должен сбрасываться */
    @observable.ref private receipt: { period: Period; id: string } | null = null;

    constructor({ source, period, viewer }: {
        source: BudgetSource,
        period: PeriodSource,
        viewer: Viewer,
    }) {
        this.memberId = viewer.userId;
        this.source = source;
        this.period = period;
        this.viewer = viewer;
        makeObservable(this);
    }

    @computed
    private get budget(): MonthlyBudget | null | undefined {
        const resource = this.source.state;
        if (resource.kind !== 'ready') return undefined;

        const budget = resource.data;
        if (budget !== null && budget.period !== this.period.selected) return undefined;

        return budget;
    }

    @computed
    get snapshot(): BudgetSnapshot | null {
        const budget = this.budget;
        if (!budget) return null;

        const selected = this.period.selected;
        return toBudgetSnapshot({
            budget,
            viewer: this.viewer,
            today: this.period.today,
            memberId: this.memberId,
            receiptId: this.receipt?.period === selected ? this.receipt.id : null,
        });
    }

    @computed
    get state(): BudgetState {
        const resource = this.source.state;
        const selected = this.period.selected;

        switch (resource.kind) {
            case 'loading':
                return { kind: 'loading' };
            case 'error':
                return {
                    kind: 'error',
                    message: resource.error.message,
                    canRetry: resource.error.isRetryable,
                };
            case 'ready': {
                if (resource.data === null) {
                    return { kind: 'absent', period: selected, isPast: selected < this.period.today };
                }

                const snapshot = this.snapshot;
                if (!snapshot) {
                    return { kind: 'loading' };
                }

                return {
                    kind: 'ready',
                    snapshot,
                    syncError: resource.syncError?.message ?? null,
                };
            }
        }
    }

    @action
    selectMember(memberId: string): void {
        this.memberId = memberId;
        this.receipt = null;
    }

    @action
    selectReceipt(receiptId: string | null): void {
        this.receipt = receiptId === null ? null : { period: this.period.selected, id: receiptId };
    }

    retry = (): void => this.source.retry();
}
