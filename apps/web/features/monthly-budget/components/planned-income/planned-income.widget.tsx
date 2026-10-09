import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { PlannedIncomeVM } from './planned-income.vm';
import { NoPlanCard } from './setup/no-plan-card';
import { PlanSetupCard } from './setup/plan-setup-card';
import { PlanSummaryCard } from './summary/plan-summary-card';

type PlannedIncomeWidgetT = {
    vm: PlannedIncomeVM;
    className?: string;
};

export const PlannedIncomeWidget: FC<PlannedIncomeWidgetT> = observer(({ vm, className }) => {
    const { view } = vm;

    switch (view.status) {
        case 'no-plan':
            return view.lock ? (
                <NoPlanCard memberName={view.memberName} lock={view.lock} className={className} />
            ) : (
                <PlanSetupCard onSubmit={vm.submit} className={className} />
            );
        case 'planned':
            return (
                <PlanSummaryCard
                    summary={view.summary}
                    lock={view.lock}
                    onSubmit={vm.submit}
                    className={className}
                />
            );
    }
});
