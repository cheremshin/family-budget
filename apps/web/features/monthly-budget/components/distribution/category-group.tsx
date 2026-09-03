import { FC } from 'react';

import { cn } from '@family-budget/ui';

import { CategoryGroup, CategoryRow } from '../../distribution.view';
import { chartBackground } from './chart-color';

type PropsT = {
    group: CategoryGroup;
    hasMultipleMembers: boolean;
    className?: string;
};

export const CategoryGroupSection: FC<PropsT> = ({ group, hasMultipleMembers, className }) => (
    <section className={cn('flex flex-col', className)}>
        <header className="flex items-baseline justify-between border-b pb-2">
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
            </span>
            <span className="text-sm font-medium tabular-nums">{group.total}</span>
        </header>

        <div className="flex flex-col divide-y">
            {group.categories.map((category) => (
                <CategoryRowItem
                    key={category.categoryId}
                    category={category}
                    hasMultipleMembers={hasMultipleMembers}
                />
            ))}
        </div>
    </section>
);

type RowPropsT = {
    category: CategoryRow;
    hasMultipleMembers: boolean;
};

const CategoryRowItem: FC<RowPropsT> = ({ category, hasMultipleMembers }) => (
    <div className="flex flex-col gap-2 py-3">
        <div className="flex items-baseline justify-between gap-4">
            <div className="flex flex-col">
                <span className="font-medium">{category.name}</span>
                {category.isRelative && (
                    <span className="text-sm text-muted-foreground">
                        {category.target} от дохода семьи
                    </span>
                )}
            </div>
            <span className="font-medium tabular-nums">{category.required}</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
            <div className="flex h-full" style={{ width: `${category.weight}%` }}>
                {category.shares.map((share) => (
                    <div
                        key={share.memberId}
                        className={chartBackground(share.colorIndex)}
                        style={{ width: `${share.weight}%` }}
                    />
                ))}
            </div>
        </div>
        {hasMultipleMembers && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {category.shares.map((share) => (
                    <span key={share.memberId} className="flex items-center gap-1.5">
                        <span
                            className={cn('size-2 rounded-full', chartBackground(share.colorIndex))}
                        />
                        {share.isMe ? 'Вы' : share.memberName}
                        <span className="tabular-nums text-foreground">{share.amount}</span>
                    </span>
                ))}
            </div>
        )}
    </div>
);
