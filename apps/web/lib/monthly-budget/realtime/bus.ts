import type { MonthlyBudgetChangedEvent } from '@family-budget/domain/monthly-budget';

import { InMemoryMonthlyBudgetEventBus } from './adapters/in-memory-monthly-budget-event-bus';

export type MonthlyBudgetEventListener = (event: MonthlyBudgetChangedEvent) => void;

export interface MonthlyBudgetEventBus {
    publish(event: MonthlyBudgetChangedEvent): void;
    subscribe(familyId: string, listener: MonthlyBudgetEventListener): () => void;
}

const globalForBus = globalThis as typeof globalThis & {
    __monthlyBudgetEventBus__?: MonthlyBudgetEventBus;
};

export const monthlyBudgetEventBus: MonthlyBudgetEventBus =
    (globalForBus.__monthlyBudgetEventBus__ ??= new InMemoryMonthlyBudgetEventBus());
