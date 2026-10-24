import { computed, makeObservable } from 'mobx';

import type { AddPlannedIncomeInput } from '@family-budget/domain/monthly-budget';

import { type Command, type CommandResult, guarded } from '@/client/core';

import type { ReadySource } from '../../model/ports';
import type { PlannedIncomeFormValues } from './planned-income.form';
import {
    type PlannedIncomeView,
    buildPlannedIncomeView,
    planLockView,
} from './planned-income.view';

export class PlannedIncomeVM {
    constructor(
        private readonly ready: ReadySource,
        private readonly setPlan: Command<AddPlannedIncomeInput>,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): PlannedIncomeView {
        return buildPlannedIncomeView(this.ready.snapshot);
    }

    submit = (values: PlannedIncomeFormValues): Promise<CommandResult> =>
        guarded(planLockView(this.ready.snapshot.planBlocker), () =>
            this.setPlan.run({ ...values, period: this.ready.period }),
        );
}
