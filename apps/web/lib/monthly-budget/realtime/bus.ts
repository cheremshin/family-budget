import { InMemoryMonthlyBudgetEventBus } from './adapters/in-memory-monthly-budget-event-bus';
import { MonthlyBudgetChangedEvent } from './types';

export type MonthlyBudgetEventListener = (event: MonthlyBudgetChangedEvent) => void;

export interface MonthlyBudgetEventBus {
    publish(event: MonthlyBudgetChangedEvent): void;
    subscribe(familyId: string, listener: MonthlyBudgetEventListener): () => void;
}

export const monthlyBudgetEventBus = new InMemoryMonthlyBudgetEventBus();
