'use client';

import {
    SidebarFooter,
    SidebarHeader,
    SidebarNavigationMenu,
    Sidebar as SidebarView,
} from '@/components/sidebar/sidebar';

import { useSidebarConfig } from './lib/config';

export const Sidebar = () => {
    const { config } = useSidebarConfig();
    return (
        <SidebarView>
            <SidebarHeader icon={config.icon} title={config.title} />
            <SidebarNavigationMenu items={config.items} />
            <SidebarFooter />
        </SidebarView>
    );
};
