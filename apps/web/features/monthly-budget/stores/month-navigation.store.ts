import { action, computed, observable } from 'mobx';

import { toMonthStart } from '@/lib/monthly-budget';

function shiftPeriod(period: string, monthsDelta: number): string {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1 + monthsDelta, 1));
    return toMonthStart(date);
}

export class MonthNavigationStore {
    @observable selectedPeriod: string;

    private readonly currentPeriod = toMonthStart(new Date());

    constructor(initialPeriod?: string) {
        this.selectedPeriod = initialPeriod ?? this.currentPeriod;
    }

    @computed
    get canGoToNextMonth(): boolean {
        return this.selectedPeriod < this.currentPeriod;
    }

    @computed
    get isCurrentMonth(): boolean {
        return this.selectedPeriod === this.currentPeriod;
    }

    @computed
    get selectedPeriodAsDate(): Date {
        const [year, month] = this.selectedPeriod.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, 1));
    }

    @action
    goToPreviousMonth(): void {
        this.selectedPeriod = shiftPeriod(this.selectedPeriod, -1);
    }

    @action
    goToNextMonth(): void {
        if (!this.canGoToNextMonth) return;
        this.selectedPeriod = shiftPeriod(this.selectedPeriod, 1);
    }

    @action
    goToPeriod(period: string): void {
        this.selectedPeriod = period;
    }

    @action
    goToCurrentMonth(): void {
        this.selectedPeriod = this.currentPeriod;
    }
}
