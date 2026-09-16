import { FC } from 'react';

import { cn } from '@family-budget/ui';

type MemberT = {
    name: string;
    plannedIncome: string | null;
    plannedIncomeWeight: string | null;
    isSelected: boolean;
    onSelect: () => void;
    className?: string;
};

export const Member: FC<MemberT> = ({
    name,
    plannedIncome,
    plannedIncomeWeight,
    isSelected,
    onSelect,
    className,
}) => (
    <button
        type="button"
        onClick={onSelect}
        className={cn(
            'w-full flex justify-between p-4 rounded-lg',
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-card',
            className,
        )}
    >
        <div className="flex gap-4 items-center">
            <div
                className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-xl',
                    isSelected ? 'bg-white/10' : 'bg-primary/80 text-primary-foreground',
                )}
            >
                {name.at(0)}
            </div>
            <div className="flex flex-col items-start">
                <span className="font-bold">{name}</span>
                <span>{plannedIncome ? 'ЗАФИКСИРОВАНО' : 'ОЖИДАЕТ'}</span>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <span className="font-bold">{plannedIncome ?? ''}</span>
            <span>{plannedIncomeWeight ?? ''}</span>
        </div>
    </button>
);
