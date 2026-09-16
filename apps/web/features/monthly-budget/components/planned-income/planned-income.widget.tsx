import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { PlannedIncomeSkeleton } from './planned-income.skeleton';
import { PlannedIncomeStore } from './planned-income.store';
import { NoPlanCard } from './setup/no-plan-card';
import { PlanSetupCard } from './setup/plan-setup-card';
import { PlanSummaryCard } from './summary/plan-summary-card';

type PlannedIncomeWidgetT = {
    store: PlannedIncomeStore;
    className?: string;
};

export const PlannedIncomeWidget: FC<PlannedIncomeWidgetT> = observer(({ store, className }) => {
    const { view } = store;

    switch (view.status) {
        case 'loading':
            return <PlannedIncomeSkeleton className={className} />;
        case 'no-plan':
            return view.lock ? (
                <NoPlanCard memberName={view.memberName} lock={view.lock} className={className} />
            ) : (
                <PlanSetupCard onSubmit={store.submit} className={className} />
            );
        case 'planned':
            return (
                <PlanSummaryCard
                    summary={view.summary}
                    lock={view.lock}
                    onSubmit={store.submit}
                    className={className}
                />
            );
    }
});
