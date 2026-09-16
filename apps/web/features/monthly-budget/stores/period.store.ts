import { action, computed, makeObservable, observable } from 'mobx';

import { type Period, shiftPeriod } from '@family-budget/domain/shared';

export class PeriodStore {
    @observable selectedPeriod: Period;

    constructor(private readonly currentPeriod: Period) {
        this.selectedPeriod = currentPeriod;
        makeObservable(this);
    }

    @computed
    get isPast(): boolean {
        return this.selectedPeriod < this.currentPeriod;
    }

    @action
    goToPeriod(period: Period): void {
        this.selectedPeriod = period;
    }

    goToPrevious = (): void => this.goToPeriod(shiftPeriod(this.selectedPeriod, -1));
    goToNext = (): void => this.goToPeriod(shiftPeriod(this.selectedPeriod, 1));
}
