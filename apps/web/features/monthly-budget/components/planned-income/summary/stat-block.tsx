import { FC, ReactNode } from 'react';

type StatBlockT = {
    label: string;
    children: ReactNode;
    className?: string;
};

export const StatBlock: FC<StatBlockT> = ({ label, children, className }) => (
    <div className={className}>
        <span className="block text-muted-foreground">{label}</span>
        <span className="block h-9 mt-1.5 content-center text-xl font-bold text-primary">
            {children}
        </span>
    </div>
);
