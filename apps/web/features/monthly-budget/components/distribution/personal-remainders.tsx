import { FC } from 'react';

import { cn } from '@family-budget/ui';

import { PersonalRow } from '../../distribution.view';

type PropsT = {
    rows: PersonalRow[];
    className?: string;
};

export const PersonalRemainders: FC<PropsT> = ({ rows, className }) => {
    const mine = rows.find((row) => row.isMe);
    const others = rows.filter((row) => !row.isMe);

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {mine && (
                <div className="flex flex-col gap-1 rounded-lg bg-accent p-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Остаётся на личные расходы
                    </span>
                    <span
                        className={cn(
                            'text-2xl font-bold tabular-nums tracking-tight',
                            mine.isNegative ? 'text-destructive' : 'text-accent-foreground',
                        )}
                    >
                        {mine.amount}
                    </span>
                </div>
            )}
            {others.length > 0 && (
                <div className="flex flex-col gap-1">
                    У остальных членов семьи:
                    {others.map((row) => (
                        <div key={row.memberId} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{row.memberName}</span>
                            <span
                                className={cn(
                                    'tabular-nums',
                                    row.isNegative && 'text-destructive',
                                )}
                            >
                                {row.amount}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
