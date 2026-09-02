import { action, computed, makeObservable, observable } from 'mobx';

import { Period, shiftPeriod, toPeriod } from '@family-budget/domain/shared';

export class MonthNavigationStore {
    @observable selectedPeriod: Period;

    private readonly currentPeriod = toPeriod(new Date());

    constructor(initialPeriod?: Period) {
        this.selectedPeriod = initialPeriod ?? this.currentPeriod;
        makeObservable(this);
    }

    @computed
    get canGoToNextMonth(): boolean {
        return this.selectedPeriod < this.currentPeriod;
    }

    @computed
    get isCurrentMonth(): boolean {
        return this.selectedPeriod === this.currentPeriod;
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
    goToPeriod(period: Period): void {
        this.selectedPeriod = period;
    }

    @action
    goToCurrentMonth(): void {
        this.selectedPeriod = this.currentPeriod;
    }
}
