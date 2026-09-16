import type { QueryClient } from 'mobx-tanstack-query';

import {
    MonthlyBudget,
    MonthlyBudgetChangedEvent,
    monthlyBudgetChangedEventSchema,
} from '@family-budget/domain/monthly-budget';

import { monthlyBudgetKeys } from './monthly-budget.cache';

const EVENTS_URL = '/api/family/monthly-budget/events';

type BudgetChange = Pick<MonthlyBudgetChangedEvent, 'familyId' | 'period' | 'version'>;

export class MonthlyBudgetLiveSync {
    private source: EventSource | null = null;
    private retainers = 0;

    constructor(private readonly queryClient: QueryClient) {}

    retain(): () => void {
        if (this.retainers++ === 0) this.open();

        let released = false;

        return () => {
            if (released) return;
            released = true;
            if (--this.retainers === 0) this.close();
        };
    }

    private open(): void {
        const source = new EventSource(EVENTS_URL);
        let opened = false;

        source.addEventListener('open', () => {
            if (opened) this.invalidateAll();
            opened = true;
        });

        source.addEventListener('monthly-budget.changed', (event) => {
            const parsed = monthlyBudgetChangedEventSchema.safeParse(
                JSON.parse((event as MessageEvent<string>).data),
            );

            if (parsed.success) this.applyRemoteChange(parsed.data);
        });

        this.source = source;
    }

    private close(): void {
        this.source?.close();
        this.source = null;
    }

    private applyRemoteChange({ familyId, period, version }: BudgetChange): void {
        const key = monthlyBudgetKeys.period(familyId, period);
        const cached = this.queryClient.getQueryData<MonthlyBudget | null>(key);

        if (cached && cached.version >= version) return;

        void this.queryClient.invalidateQueries({ queryKey: key, exact: true });
    }

    private invalidateAll(): void {
        void this.queryClient.invalidateQueries({ queryKey: monthlyBudgetKeys.all() });
    }
}

const instances = new WeakMap<QueryClient, MonthlyBudgetLiveSync>();

export function getMonthlyBudgetLiveSync(queryClient: QueryClient): MonthlyBudgetLiveSync {
    let instance = instances.get(queryClient);

    if (!instance) {
        instance = new MonthlyBudgetLiveSync(queryClient);
        instances.set(queryClient, instance);
    }

    return instance;
}
