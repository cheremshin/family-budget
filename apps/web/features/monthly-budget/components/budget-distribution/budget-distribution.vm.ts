import { computed, makeObservable } from 'mobx';

import type { ReadySource } from '../../model/ports';
import {
    type BudgetDistributionView,
    buildBudgetDistributionView,
} from './budget-distribution.view';

export class BudgetDistributionVM {
    constructor(private readonly ready: ReadySource) {
        makeObservable(this);
    }

    @computed
    get view(): BudgetDistributionView {
        return buildBudgetDistributionView(this.ready.snapshot);
    }
}
