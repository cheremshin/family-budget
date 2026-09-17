import { action, computed, makeObservable, observable } from 'mobx';

import { Period, shiftPeriod } from '@family-budget/domain/shared';

import { formatDateWide, formatMonthShort } from '@/lib/i18n';

import { BudgetStore } from '../../stores/budget.store';
import { PeriodStore } from '../../stores/period.store';
import { DateView } from './date-picker.view';

export class DateStore {
    @observable private isOpen = false;
    @observable private yearStart: Period;

    constructor(
        private readonly budgetStore: BudgetStore,
        private readonly periodStore: PeriodStore,
    ) {
        this.yearStart = startOfYear(periodStore.selectedPeriod);
        makeObservable(this);
    }

    @computed
    get view(): DateView {
        const selected = this.periodStore.selectedPeriod;
        return {
            label: formatDateWide(selected),
            isLoading: this.budgetStore.state.kind === 'loading',
            isOpen: this.isOpen,
            year: this.yearStart.slice(0, 4),
            months: Array.from({ length: 12 }, (_, i) => {
                const period = shiftPeriod(this.yearStart, i);
                return {
                    period,
                    label: formatMonthShort(period),
                    isSelected: period === selected,
                    isCurrent: period === this.periodStore.currentPeriod,
                };
            }),
        };
    }

    @action
    setOpen = (open: boolean): void => {
        this.isOpen = open;
        if (open) this.yearStart = startOfYear(this.periodStore.selectedPeriod);
    };

    @action
    shiftYear = (delta: number): void => {
        this.yearStart = shiftPeriod(this.yearStart, delta * 12);
    };

    selectMonth = (period: Period): void => {
        this.periodStore.goToPeriod(period);
        this.setOpen(false);
    };

    goToNext = (): void => this.periodStore.goToNext();
    goToPrevious = (): void => this.periodStore.goToPrevious();
}

const startOfYear = (period: Period): Period => `${period.slice(0, 4)}-01-01`;
