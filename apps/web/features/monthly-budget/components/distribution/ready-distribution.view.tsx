import { FC } from 'react';

import { PieChart, TriangleAlert } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, cn } from '@family-budget/ui';

import { ReadyDistribution } from '../../distribution.view';
import { CategoryGroupSection } from './category-group';
import { PersonalRemainders } from './personal-remainders';

type PropsT = {
    view: ReadyDistribution;
    className?: string;
};

export const ReadyDistributionView: FC<PropsT> = ({ view, className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart />
                Распределение по категориям
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                    {view.isFinal ? 'Зафиксировано' : 'Предварительно'}
                </span>
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
            {view.isOverAllocated && <OverAllocationNotice />}
            <PersonalRemainders rows={view.personal} />
            {view.groups.map((group) => (
                <CategoryGroupSection
                    key={group.type}
                    group={group}
                    hasMultipleMembers={view.hasMultipleMembers}
                />
            ))}
            <div className="flex items-baseline justify-between border-t pt-4">
                <span className="font-medium">Всего распределено</span>
                <span className="text-lg font-bold tabular-nums">{view.total}</span>
            </div>
        </CardContent>
    </Card>
);

type NoticePropsT = {
    className?: string;
};

/** Ровно то условие, по которому сервер откажет в закрытии месяца. */
const OverAllocationNotice: FC<NoticePropsT> = ({ className }) => (
    <div
        className={cn(
            'flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive',
            className,
        )}
    >
        <TriangleAlert className="size-5 shrink-0" />
        <span>
            Категории требуют больше планового дохода. Пока это так, месяц закрыть нельзя — уменьшите
            цели или увеличьте план.
        </span>
    </div>
);
