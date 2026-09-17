import { FC } from 'react';

import { Card, CardAction, CardContent, CardHeader, CardTitle, Skeleton } from '@family-budget/ui';

type PlannedIncomeSkeletonT = {
    className?: string;
};

export const PlannedIncomeSkeleton: FC<PlannedIncomeSkeletonT> = ({ className }) => (
    <Card className={className}>
        <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">План доходов на месяц</CardTitle>
            <CardAction>
                <Skeleton className="h-9 w-28" />
            </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 rounded-md bg-accent p-4">
                {['Запланированно', 'Получено'].map((label) => (
                    <div key={label}>
                        <span className="block text-muted-foreground">{label}</span>
                        <span className="mt-1.5 flex h-9 items-center">
                            <Skeleton className="h-6 w-28 bg-background" />
                        </span>
                    </div>
                ))}
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
    </Card>
);
