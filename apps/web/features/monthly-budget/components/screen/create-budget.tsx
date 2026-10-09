'use client';

import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import type { Period } from '@family-budget/domain/shared';

import { useScopeVM } from '../../budget-scope.context';
import { CreateBudgetCard } from './create-budget.card';
import { CreateBudgetVM } from './create-budget.vm';

type CreateBudgetT = {
    period: Period;
    isPast: boolean;
};

export const CreateBudget: FC<CreateBudgetT> = observer(({ period, isPast }) => {
    const vm = useScopeVM(
        (scope) => new CreateBudgetVM(period, isPast, scope.commands.createBudget),
    );
    const { view } = vm;

    return (
        <div className="relative">
            <CreateBudgetCard
                isPast={view.isPast}
                isCreating={view.isCreating}
                error={view.error}
                onCreate={vm.create}
            />
        </div>
    );
});
