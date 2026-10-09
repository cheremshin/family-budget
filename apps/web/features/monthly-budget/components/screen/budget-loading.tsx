import { FC } from 'react';

import { Spinner } from '@family-budget/ui';

export const BudgetLoading: FC = () => (
    <div className="flex min-h-96 items-center justify-center">
        <Spinner delayMs={500} className="size-8 text-muted-foreground" />
    </div>
);
