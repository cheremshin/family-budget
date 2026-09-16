import { computed, makeObservable } from 'mobx';

import { toKopecks } from '@family-budget/domain/shared';

import { formatMoney } from '@/lib/i18n';

import { BudgetStore } from '../../stores/budget.store';
import { SelectionStore } from '../../stores/selection.store';
import { MembersView } from './member-select.view';

export class MembersStore {
    constructor(
        private readonly budgetStore: BudgetStore,
        private readonly selectionStore: SelectionStore,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): MembersView {
        const budget = this.budgetStore.budget;
        if (!budget) return { status: 'loading' };

        const total = budget.memberIncomes.reduce(
            (acc, member) =>
                member.plannedAmount === null ? acc : acc + toKopecks(member.plannedAmount),
            0,
        );
        const selectedId = this.selectionStore.member?.memberId;

        return {
            status: 'ready',
            members: budget.memberIncomes.map((member) => ({
                id: member.memberId,
                name: member.memberName,
                isSelected: member.memberId === selectedId,
                plannedIncome:
                    member.plannedAmount === null ? null : formatMoney(member.plannedAmount),
                plannedIncomeWeight:
                    member.plannedAmount === null || total === 0
                        ? null
                        : `${((toKopecks(member.plannedAmount) / total) * 100).toFixed(1)}%`,
            })),
        };
    }

    select = (memberId: string): void => this.selectionStore.selectMember(memberId);
}
