import { computed, makeObservable } from 'mobx';

import type { CloseMonthlyBudgetInput } from '@family-budget/domain/monthly-budget';

import { type Command, type CommandResult, guarded } from '@/client/core';

import type { ReadySource } from '../../model/ports';
import { type CloseMonthView, buildCloseMonthView, closeBlockerView } from './close-month.view';

export class CloseMonthVM {
    constructor(
        private readonly ready: ReadySource,
        private readonly closeMonth: Command<CloseMonthlyBudgetInput>,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): CloseMonthView {
        return buildCloseMonthView(this.ready.snapshot, this.closeMonth);
    }

    prepare = (): void => this.closeMonth.reset();

    close = (): Promise<CommandResult> =>
        guarded(closeBlockerView(this.ready.snapshot.closeBlocker), () =>
            this.closeMonth.run({ period: this.ready.period }),
        );
}
