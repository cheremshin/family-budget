import { MonthlyBudgetEventBus, MonthlyBudgetEventListener } from '../bus';
import { MonthlyBudgetChangedEvent } from '../types';

export class InMemoryMonthlyBudgetEventBus implements MonthlyBudgetEventBus {
    private readonly listeners = new Map<string, Set<MonthlyBudgetEventListener>>();

    publish(event: MonthlyBudgetChangedEvent): void {
        const listeners = this.listeners.get(event.familyId);

        if (!listeners) {
            return;
        }

        for (const listener of listeners) {
            try {
                listener(event);
            } catch (error) {
                console.error('[MothlyBudgetEventBus] listener threw', error);
            }
        }
    }

    subscribe(familyId: string, listener: MonthlyBudgetEventListener): () => void {
        let listeners = this.listeners.get(familyId);

        if (!listeners) {
            listeners = new Set();
            this.listeners.set(familyId, listeners);
        }

        listeners.add(listener);

        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.listeners.delete(familyId);
            }
        };
    }
}
