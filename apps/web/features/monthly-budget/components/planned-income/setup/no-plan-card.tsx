import { FC } from 'react';

import { Wallet } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@family-budget/ui';

import type { PlanLockView } from '../planned-income.view';

type NoPlanCardT = {
    memberName: string;
    lock: NonNullable<PlanLockView>;
    className?: string;
};

export const NoPlanCard: FC<NoPlanCardT> = ({ memberName, lock, className }) => {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex gap-2 text-lg">
                    <Wallet />
                    План не установлен
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-accent text-accent-foreground rounded-md">
                    {lock.reason === 'foreign'
                        ? `Дождитесь пока ${memberName} установит план на месяц`
                        : lock.message}
                </div>
            </CardContent>
        </Card>
    );
};
