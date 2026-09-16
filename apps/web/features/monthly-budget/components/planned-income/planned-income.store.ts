import { computed, makeObservable } from 'mobx';

import { sumMoney, toKopecks } from '@family-budget/domain/shared';

import { ClientError, CommandResult } from '@/client/core';
import { SetPlannedIncomeCommand } from '@/client/monthly-budget';
import { formatMoney } from '@/lib/i18n';

import { BudgetStore } from '../../stores/budget.store';
import { SelectionStore } from '../../stores/selection.store';
import { PlannedIncomeFormValues } from './planned-income.form';
import { PlanLock, PlannedIncomeView } from './planned-income.view';

const LOCK_MESSAGES: Record<PlanLock, string> = {
    closed: 'Месяц закрыт - план нельзя изменить',
    foreign: 'Изменить план может только его владелец',
};

export class PlannedIncomeStore {
    constructor(
        private readonly budgetStore: BudgetStore,
        private readonly selectionStore: SelectionStore,
        private readonly setPlannedIncome: SetPlannedIncomeCommand,
    ) {
        makeObservable(this);
    }

    @computed
    private get lock(): PlanLock | null {
        if (this.budgetStore.budget?.isClosed) return 'closed';
        if (!this.selectionStore.isViewingSelf) return 'foreign';

        return null;
    }

    @computed
    get view(): PlannedIncomeView {
        const member = this.selectionStore.member;
        if (!this.budgetStore.budget || !member) return { status: 'loading' };

        const lock = this.lock ? { reason: this.lock, message: LOCK_MESSAGES[this.lock] } : null;

        if (member.plannedAmount === null) {
            return {
                status: 'no-plan',
                memberName: member.memberName,
                lock,
            };
        }

        const received = sumMoney(member.incomeReceipts.map((receipt) => receipt.amount));
        const planned = toKopecks(member.plannedAmount);
        const percent = planned === 0 ? null : Math.round((toKopecks(received) / planned) * 100);

        return {
            status: 'planned',
            lock,
            summary: {
                plannedAmount: formatMoney(member.plannedAmount),
                plannedAmountValue: member.plannedAmount,
                received: formatMoney(received),
                progress: percent === null ? 0 : Math.min(percent, 100),
                progressLabel: percent === null ? '-' : `${percent}%`,
            },
        };
    }

    submit = (values: PlannedIncomeFormValues): Promise<CommandResult> => {
        const budget = this.budgetStore.budget;

        if (!budget) {
            return Promise.resolve({
                ok: false,
                error: new ClientError('unexpected', 'Бюджет ещё загружается'),
            });
        }

        if (this.lock) {
            return Promise.resolve({
                ok: false,
                error: new ClientError('domain', LOCK_MESSAGES[this.lock]),
            });
        }

        return this.setPlannedIncome.run({ ...values, period: budget.period });
    };
}
