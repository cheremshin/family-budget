import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useDistributionView } from '../../budget-provider.vm';
import { AwaitingPlansView } from './awaiting-plans.view';
import { DistributionSkeleton } from './distribution.skeleton';
import { ReadyDistributionView } from './ready-distribution.view';

type PropsT = {
    className?: string;
};

export const Distribution: FC<PropsT> = observer(({ className }) => {
    const view = useDistributionView();

    switch (view.kind) {
        case 'loading':
            return <DistributionSkeleton className={className} />;
        case 'awaiting-plans':
            return <AwaitingPlansView view={view} className={className} />;
        case 'ready':
            return <ReadyDistributionView view={view} className={className} />;
    }
});
