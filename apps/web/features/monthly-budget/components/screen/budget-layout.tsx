import { FC, PropsWithChildren, ReactNode } from 'react';

type BudgetLayoutT = PropsWithChildren<{ banner?: ReactNode }>;

export const BudgetLayout: FC<BudgetLayoutT> = ({ banner, children }) => (
    <div className="flex flex-col gap-6">
        {banner}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex w-full max-w-xl flex-col gap-6">{children}</div>
        </div>
    </div>
);
