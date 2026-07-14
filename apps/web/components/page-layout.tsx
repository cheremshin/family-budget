import { cn } from '@ui/index';
import { FC, PropsWithChildren } from 'react';

export const PageContainer: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return <div className={cn('p-8', className)}>{children}</div>;
};

export const PageHeader: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return (
        <div className={cn('flex justify-between items-start gap-4', className)}>{children}</div>
    );
};

export const PageHeaderContent: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return <div className={cn('flex-1 flex-col', className)}>{children}</div>;
};

export const PageHeaderActions: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return <div className={cn('flex items-center gap-2', className)}>{children}</div>;
};

export const PageTitle: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return <h1 className={cn('text-3xl font-bold tracking-tight', className)}>{children}</h1>;
};

export const PageDescription: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return <p className={cn('text-muted-foreground mt-1', className)}>{children}</p>;
};

export const PageContent: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return <div className={cn('mt-8', className)}>{children}</div>;
};
