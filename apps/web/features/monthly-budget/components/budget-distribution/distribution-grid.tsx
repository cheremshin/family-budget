import { FC } from 'react';

import { Landmark, LucideIcon, PiggyBank, Wallet } from 'lucide-react';

import { cn } from '@family-budget/ui';

import {
    DistributionColumn,
    DistributionRow,
    DistributionRowKind,
} from './budget-distribution.view';

type DistributionGridT = {
    columns: DistributionColumn[];
    rows: DistributionRow[];
};

const ROW_ICON = {
    savings: PiggyBank,
    expense: Landmark,
    personal: Wallet,
} satisfies Record<DistributionRowKind, LucideIcon>;

export const DistributionGrid: FC<DistributionGridT> = ({ columns, rows }) => {
    const template = {
        gridTemplateColumns: `minmax(0, 1fr) repeat(${columns.length}, minmax(6rem, 8rem))`,
    };

    return (
        <div className="flex flex-col gap-2">
            <div style={template} className="grid gap-2 px-4 text-xs text-muted-foreground">
                <span>Категория</span>
                {columns.map((column) => (
                    <span
                        key={column.memberId}
                        className={cn('text-right font-medium', column.isViewer && 'text-primary')}
                    >
                        {column.memberName}
                    </span>
                ))}
            </div>
            {rows.map((row) => {
                const Icon = ROW_ICON[row.kind];

                return (
                    <div
                        key={row.id}
                        style={template}
                        className={cn(
                            'grid items-center gap-2 rounded-lg px-4 py-3',
                            row.kind === 'personal'
                                ? 'border border-primary/20 bg-primary/5'
                                : 'bg-accent',
                        )}
                    >
                        <span className="flex min-w-0 items-center gap-2.5">
                            <Icon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate font-medium">{row.name}</span>
                                <span className="text-xs text-muted-foreground">{row.hint}</span>
                            </span>
                        </span>
                        {row.cells.map((cell) => (
                            <span
                                key={cell.column.memberId}
                                className={cn(
                                    'text-right font-semibold tabular-nums',
                                    cell.column.isViewer && 'text-primary',
                                )}
                            >
                                {cell.amount}
                            </span>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
