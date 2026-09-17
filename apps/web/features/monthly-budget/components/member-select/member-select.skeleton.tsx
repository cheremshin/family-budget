import { FC } from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Skeleton,
} from '@family-budget/ui';

type MemberSelectSkeletonT = {
    className?: string;
};

export const MemberSelectSkeleton: FC<MemberSelectSkeletonT> = ({ className }) => {
    const MEMBER_ROWS = 2;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Участники</CardTitle>
                <CardDescription>Планирование на текущий месяц</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 p-3">
                <div className="flex flex-col gap-4">
                    {Array.from({ length: MEMBER_ROWS }, (_, i) => (
                        <div key={i} className="flex w-full justify-between rounded-lg p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
