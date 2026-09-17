import { FC } from 'react';

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@family-budget/ui';

type ActualIncomesSkeletonT = {
    className?: string;
};

export const ActualIncomesSkeleton: FC<ActualIncomesSkeletonT> = ({ className }) => {
    const RECEIPT_ROWS = 3;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Поступления</CardTitle>
                <CardDescription>Для детализации нажмите на поступление</CardDescription>
                <CardAction>
                    <Skeleton className="h-9 w-9" />
                </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col justify-center gap-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-25">Дата поступления</TableHead>
                            <TableHead className="text-right">Сумма</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: RECEIPT_ROWS }, (_, i) => (
                            <TableRow key={i} className="hover:bg-transparent">
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="ml-auto h-4 w-24" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
