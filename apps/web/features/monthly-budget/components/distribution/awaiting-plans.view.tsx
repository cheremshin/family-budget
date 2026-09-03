import { FC } from 'react';

import { PieChart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@family-budget/ui';

import { categoryTypeLabels } from '@/lib/i18n';

import { AwaitingPlans } from '../../distribution.view';

type PropsT = {
    view: AwaitingPlans;
    className?: string;
};

/**
 * Пока план есть не у всех, распределение считать не из чего: подставить ноль за
 * незаполнивших исказило бы доли. Показываем то, что известно точно, — цели категорий.
 */
export const AwaitingPlansView: FC<PropsT> = ({ view, className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart />
                Распределение по категориям
            </CardTitle>
            <CardDescription>
                Ждём плановый доход: {view.awaiting.join(', ')}. До этого можно посмотреть только
                цели категорий.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
            {view.targets.map((target) => (
                <div key={target.categoryId} className="flex items-baseline justify-between py-3">
                    <div className="flex flex-col">
                        <span className="font-medium">{target.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {categoryTypeLabels[target.type]}
                        </span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                        {target.target}
                        {target.isRelative && ' от дохода семьи'}
                    </span>
                </div>
            ))}
        </CardContent>
    </Card>
);
