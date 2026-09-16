import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { BudgetVM } from '../../budget.vm';
import { ActualIncomesWidget } from '../actual-incomes/actual-incomes.widget';
import { MembersSelectWidget } from '../member-select/member-select.widget';
import { PlannedIncomeWidget } from '../planned-income/planned-income.widget';
import { BudgetErrorCard } from './budget-error.card';
import { BudgetLayout } from './budget-layout';
import { BudgetSkeleton } from './budget.skeleton';
import { CreateBudgetCard } from './create-budget.card';
import { SyncErrorBanner } from './sync-error.banner';

export const BudgetScreen: FC<{ vm: BudgetVM }> = observer(({ vm }) => {
    const { screen } = vm;
    const { view } = screen;

    switch (view.status) {
        case 'loading':
            return <BudgetSkeleton />;
        case 'error':
            return (
                <BudgetErrorCard
                    message={view.message}
                    onRetry={view.canRetry ? screen.retry : undefined}
                />
            );
        case 'not-started':
            return (
                <CreateBudgetCard
                    isPast={view.isPast}
                    isCreating={view.isCreating}
                    error={view.error}
                    onCreate={screen.create}
                />
            );
        case 'ready':
            return (
                <BudgetLayout
                    banner={
                        view.syncError && (
                            <SyncErrorBanner message={view.syncError} onRetry={screen.retry} />
                        )
                    }
                >
                    <MembersSelectWidget store={vm.members} />
                    <PlannedIncomeWidget store={vm.plannedIncome} />
                    <ActualIncomesWidget store={vm.receipts} />
                </BudgetLayout>
            );
    }
});
