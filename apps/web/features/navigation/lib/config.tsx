'use client';

import { useMemo } from 'react';

import { usePathname } from 'next/navigation';

import { HomeIcon, LayersIcon, SettingsIcon, TrendingUpIcon, WalletIcon } from 'lucide-react';

import { NavigationConfig } from './types';

export const useSidebarConfig = () => {
    const pathname = usePathname();
    const config = useMemo<NavigationConfig>(
        () => ({
            title: 'FamilyBudget',
            icon: WalletIcon,
            items: [
                {
                    id: 'home',
                    label: 'Главная',
                    href: '/home',
                    icon: HomeIcon,
                    isActive: pathname === '/home',
                },
                {
                    id: 'incomes',
                    label: 'Доходы',
                    href: '/incomes',
                    icon: TrendingUpIcon,
                    isActive: pathname === '/incomes',
                },
                {
                    id: 'budget-categories',
                    label: 'Категории',
                    href: '/categories',
                    icon: LayersIcon,
                    isActive: pathname === '/categories',
                },
                {
                    id: 'settings',
                    label: 'Настройки',
                    href: '/settings',
                    icon: SettingsIcon,
                    isActive: pathname === '/settings',
                },
            ],
        }),
        [pathname],
    );

    return useMemo(
        () => ({
            config,
        }),
        [config],
    );
};
