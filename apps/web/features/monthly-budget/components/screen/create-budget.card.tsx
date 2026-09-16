import type { FC } from 'react';

import { Plus } from 'lucide-react';

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@family-budget/ui';

type CreateBudgetCardT = {
    isPast: boolean;
    isCreating: boolean;
    error: string | null;
    onCreate: () => void;
};

export const CreateBudgetCard: FC<CreateBudgetCardT> = ({
    isPast,
    isCreating,
    error,
    onCreate,
}) => (
    <div className="flex justify-center">
        <Card className="w-full max-w-lg py-8">
            <CardHeader className="text-center">
                <CardTitle>За указанный расчётный период нет записей</CardTitle>
                {isPast && (
                    <CardDescription>Рекомендуется работать с текущим месяцем</CardDescription>
                )}
            </CardHeader>
            <CardContent className="mt-4 flex flex-col items-center gap-2">
                <Button
                    variant="ghost"
                    className="bg-accent"
                    onClick={onCreate}
                    disabled={isCreating}
                >
                    <Plus />
                    {isCreating ? 'Создаём…' : 'Создать'}
                </Button>
                {error && <p className="text-destructive text-sm">{error}</p>}
            </CardContent>
        </Card>
    </div>
);
