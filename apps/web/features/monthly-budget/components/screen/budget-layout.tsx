import { cn } from '@family-budget/ui';
import { FC, ReactNode } from 'react';

type BudgetLayoutT = {
    main: ReactNode;
    aside: ReactNode;
    banner?: ReactNode;
    className?: string;
};

export const BudgetLayout: FC<BudgetLayoutT> = ({ main, aside, banner, className }) => (
    <div className={cn("flex flex-col gap-6", className)}>
        {banner}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,36rem)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-6">{main}</div>
            <div className="flex min-w-0 flex-col gap-6">{aside}</div>
        </div>
    </div>
);
