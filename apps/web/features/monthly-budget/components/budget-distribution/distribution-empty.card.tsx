import { FC } from 'react';

import { PieChart } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@family-budget/ui';

type DistributionEmptyCardT = {
    message: string;
    className?: string;
};

export const DistributionEmptyCard: FC<DistributionEmptyCardT> = ({ message, className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="flex gap-2 text-lg">
                <PieChart />
                Распределение недоступно
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="rounded-md bg-accent p-4 text-accent-foreground">{message}</div>
        </CardContent>
    </Card>
);
