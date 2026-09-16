import type { FC } from 'react';

import { RefreshCw, TriangleAlert } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@family-budget/ui';

type BudgetErrorCardT = {
    message: string;
    onRetry?: () => void;
};

export const BudgetErrorCard: FC<BudgetErrorCardT> = ({ message, onRetry }) => (
    <div className="flex justify-center">
        <Card className="w-full max-w-lg py-8">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <TriangleAlert />
                    Не удалось загрузить месяц
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground text-center">{message}</p>
                {onRetry && (
                    <Button variant="outline" onClick={onRetry}>
                        <RefreshCw />
                        Повторить
                    </Button>
                )}
            </CardContent>
        </Card>
    </div>
);
