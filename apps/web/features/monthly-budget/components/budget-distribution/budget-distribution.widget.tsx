import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@family-budget/ui';

import type { BudgetDistributionVM } from './budget-distribution.vm';
import { DistributionEmptyCard } from './distribution-empty.card';
import { DistributionGrid } from './distribution-grid';
import { SettlementNote } from './settlement-note';

type BudgetDistributionWidgetT = {
    vm: BudgetDistributionVM;
    className?: string;
};

export const BudgetDistributionWidget: FC<BudgetDistributionWidgetT> = observer(
    ({ vm, className }) => {
        const { view } = vm;

        switch (view.status) {
            case 'hidden':
                return null;
            case 'empty':
                return <DistributionEmptyCard message={view.message} className={className} />;
            case 'month':
                return (
                    <Card className={className}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg gap-2">
                                Распределение по категориям
                                {view.isPreview && (
                                    <span className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                                        Предпросмотр
                                    </span>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Кто из участников сколько вкладывает в категории
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <DistributionGrid columns={view.columns} rows={view.rows} />
                            {view.settlement && <SettlementNote settlement={view.settlement} />}
                        </CardContent>
                    </Card>
                );
            case 'receipt':
                return (
                    <Card className={className}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Поступление {view.receipt.amount}
                            </CardTitle>
                            <CardDescription>
                                {view.receipt.receivedAt} - Как распределяется это поступление
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DistributionGrid columns={view.columns} rows={view.rows} />
                        </CardContent>
                    </Card>
                );
        }
    },
);
