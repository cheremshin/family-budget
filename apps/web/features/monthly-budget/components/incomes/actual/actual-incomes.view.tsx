import { FC } from 'react';

import { Lock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@family-budget/ui';

import { PlannedIncomeView } from '../../../budget.view';
import { AddIncomeDialog } from './add-income.dialog';
import { CurrentPlan } from './current-plan';
import { IncomesList } from './incomes-list';
import { IncomesStatus } from './incomes-status';

type PropsT = {
    income: PlannedIncomeView;
    isClosed: boolean;
    className?: string;
};

export const ActualIncomesView: FC<PropsT> = ({ income, isClosed, className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="flex gap-2 text-lg">
                <Lock />
                {isClosed ? 'Месяц закрыт' : 'План зафиксирован'}
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
            <CurrentPlan amount={income.plannedAmount} />
            <IncomesStatus remaining={income.remaining} progress={income.progress} />
            <IncomesList receipts={income.receipts} />
            <AddIncomeDialog onSubmit={income.addIncome} />
        </CardContent>
    </Card>
);
