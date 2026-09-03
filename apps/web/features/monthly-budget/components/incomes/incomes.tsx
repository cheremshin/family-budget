import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useBudgetView } from '../../budget-provider.vm';
import { ActualIncomesView } from './actual/actual-incomes.view';
import { IncomesSkeleton } from './incomes.skeleton';
import { NotParticipantView } from './not-participant.view';
import { SetupPlannedIncomeView } from './setup/setup-planned.view';

type PropsT = {
    className?: string;
};

export const Incomes: FC<PropsT> = observer(({ className }) => {
    const view = useBudgetView();

    if (view.kind === 'loading') {
        return <IncomesSkeleton className={className} />;
    }

    if (view.userIncome.kind === 'absent') {
        return <NotParticipantView className={className} />;
    }

    if (view.userIncome.kind === 'no-plan') {
        return <SetupPlannedIncomeView onSubmit={view.userIncome.setPlan} className={className} />;
    }

    return (
        <ActualIncomesView
            income={view.userIncome}
            isClosed={view.kind === 'closed'}
            className={className}
        />
    );
});
