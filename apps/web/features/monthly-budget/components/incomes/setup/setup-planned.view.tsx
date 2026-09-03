import { FC } from 'react';

import { Wallet } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@family-budget/ui';

import { PlannedIncomeForm } from './planned-income.form';

type PropsT = {
    onSubmit: (amount: string) => Promise<unknown>;
    className?: string;
};

export const SetupPlannedIncomeView: FC<PropsT> = ({ onSubmit, className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="text-lg flex gap-2">
                <Wallet />
                Установить план
            </CardTitle>
        </CardHeader>
        <CardContent>
            <PlannedIncomeForm onSubmit={(values) => onSubmit(values.amount)} />
        </CardContent>
    </Card>
);
