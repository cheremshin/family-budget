'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { NavigationConfig } from './types';
import {
    HomeIcon,
    SettingsIcon,
    TrendingUpIcon,
    WalletIcon,
} from 'lucide-react';

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
