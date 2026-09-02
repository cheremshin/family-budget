import { makeObservable } from 'mobx';

import { type MonthlyBudgetChangedEvent } from '@/lib/monthly-budget';

export class MonthlyBudgetLiveStore {
    private eventSource: EventSource | null = null;
    private readonly eventTypes = ['monthly-budget.changed'];

    constructor(private readonly onChange: (budget: MonthlyBudgetChangedEvent) => void) {
        makeObservable(this);
    }

    connect(): void {
        if (this.eventSource) return;
        const source = new EventSource('/api/family/monthly-budget/events');

        for (const type of this.eventTypes) {
            source.addEventListener(type, (event) => {
                const payload: MonthlyBudgetChangedEvent = JSON.parse((event as MessageEvent).data);
                this.onChange(payload);
            });
        }

        this.eventSource = source;
    }

    disconnect(): void {
        this.eventSource?.close();
        this.eventSource = null;
    }
}
