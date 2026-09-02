import { FC } from 'react';

type PropsT = {
    amount: string;
};

export const CurrentPlan: FC<PropsT> = ({ amount }) => (
    <div className="flex flex-col gap-1 bg-accent p-4 rounded-lg">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Ожидается к концу месяца
        </span>
        <span className="text-2xl font-bold text-accent-foreground tracking-tight">{amount}</span>
    </div>
);
