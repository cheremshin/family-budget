'use client';

import { ComponentProps, CSSProperties, FC } from 'react';
import { LucideIcon } from 'lucide-react';
import { buttonVariants, cn } from '@ui/index';
import { Logout } from './logout/logout';
import { NavigationItem } from './types';
import Link, { LinkProps } from 'next/link';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_ICON_WIDTH = '3rem';

export const Sidebar: FC<ComponentProps<'div'>> = ({
    children,
    className,
    ...props
}) => {
    return (
        <aside
            style={
                {
                    '--sidebar-width': SIDEBAR_WIDTH,
                    '--sidebar-icon-width': SIDEBAR_ICON_WIDTH,
                } as CSSProperties
            }
        >
            <div className="w-(--sidebar-width) bg-transparent"></div>
            <div className="fixed inset-y-0 left-0 z-10 flex h-svh w-(--sidebar-width)">
                <div
                    className={cn(
                        'w-full h-full flex flex-col border-border border-r-[1] bg-(--sidebar) color-(--sidebar-foregorund)',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </div>
            </div>
        </aside>
    );
};

export const SidebarHeader: FC<
    {
        title: string;
        icon: LucideIcon;
    } & ComponentProps<'div'>
> = ({ className, title, icon: Icon, ...props }) => {
    return (
        <div
            className={cn('flex gap-3 p-6 items-center', className)}
            {...props}
        >
            <div className="w-8 h-8 rounded-lg bg-(--sidebar-foreground) flex items-center justify-center">
                <Icon color="white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-semibold">{title}</span>
        </div>
    );
};

export const SidebarNavigationMenu: FC<
    {
        items: NavigationItem[];
    } & ComponentProps<'nav'>
> = ({ className, items, ...props }) => {
    return (
        <nav
            className={cn(
                'flex flex-col flex-1 p-6 gap-2 overflow-auto',
                className,
            )}
            {...props}
        >
            {items.map((item) => {
                const { id, label, icon: Icon, href, isActive } = item;
                return (
                    <SidebarNavigationMenuItem
                        key={id}
                        href={href}
                        isActive={isActive}
                    >
                        <Icon />
                        {label}
                    </SidebarNavigationMenuItem>
                );
            })}
        </nav>
    );
};

export const SidebarNavigationMenuItem: FC<
    { isActive: boolean | undefined } & LinkProps & ComponentProps<'a'>
> = ({ isActive, className, href, children, ...props }) => {
    const classes = cn(
        buttonVariants({
            variant: isActive ? 'default' : 'ghost',
            className: 'w-full justify-start gap-2',
        }),
        isActive && 'cursor-default',
        className,
    );
    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            onClick={isActive ? (e) => e.preventDefault() : undefined}
            className={classes}
            {...props}
        >
            {children}
        </Link>
    );
};

export const SidebarFooter: FC<ComponentProps<'div'>> = ({
    className,
    ...props
}) => {
    return (
        <div
            className={cn('p-6 border-border border-t-[1]', className)}
            {...props}
        >
            <Logout className="w-full justify-start gap-2" />
        </div>
    );
};
