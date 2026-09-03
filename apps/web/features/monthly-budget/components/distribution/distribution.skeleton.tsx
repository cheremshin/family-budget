import { FC } from 'react';

import { Card, CardContent, CardHeader } from '@family-budget/ui';

type PropsT = {
    className?: string;
};

export const DistributionSkeleton: FC<PropsT> = ({ className }) => (
    <Card className={className}>
        <CardHeader>
            <div className="h-6 w-64 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-48 animate-pulse rounded bg-muted" />
        </CardContent>
    </Card>
);
