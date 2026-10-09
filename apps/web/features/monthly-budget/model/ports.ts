import type { MonthlyBudget } from '@family-budget/domain/monthly-budget';
import type { Period } from '@family-budget/domain/shared';

import type { ResourceState } from '@/client/core';

import type { BudgetSnapshot } from './budget.snapshot';

export interface PeriodSource {
    readonly selected: Period;
    readonly today: Period;
}

export interface BudgetSource {
    readonly state: ResourceState<MonthlyBudget | null>;
    retry(): void;
}

export interface ReadySource {
    readonly period: Period;
    readonly snapshot: BudgetSnapshot;
}

export interface MemberSelection {
    selectMember(memberId: string): void;
}

export interface ReceiptSelection {
    selectReceipt(receiptId: string | null): void;
}
