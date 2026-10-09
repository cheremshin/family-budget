'use client';

import { FC, ReactNode } from 'react';

import { observer } from 'mobx-react-lite';

import { BudgetLoading } from '@/features/monthly-budget/components/screen/budget-loading';

import { useBudgetScope } from '../../budget-scope.context';
import { BudgetErrorCard } from './budget-error.card';
import { BudgetLayout } from './budget-layout';
import { CreateBudget } from './create-budget';
import { ReadyGate } from './ready-gate';
import { SyncErrorBanner } from './sync-error.banner';

type BudgetGateT = {
    main: ReactNode;
    aside: ReactNode;
};

export const BudgetGate: FC<BudgetGateT> = observer(({ main, aside }) => {
    const { model } = useBudgetScope();
    const state = model.state;

    switch (state.kind) {
        case 'loading':
            return <BudgetLoading />;
        case 'error':
            return (
                <BudgetErrorCard
                    message={state.message}
                    onRetry={state.canRetry ? model.retry : undefined}
                />
            );
        case 'absent':
            return <CreateBudget key={state.period} period={state.period} isPast={state.isPast} />;
        case 'ready':
            return (
                <ReadyGate key={state.snapshot.period} model={model} period={state.snapshot.period}>
                    <BudgetLayout
                        banner={
                            state.syncError && (
                                <SyncErrorBanner message={state.syncError} onRetry={model.retry} />
                            )
                        }
                        main={main}
                        aside={aside}
                    />
                </ReadyGate>
            );
    }
});
