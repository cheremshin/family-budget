'use client';

import { useSidebarConfig } from './lib/config';
import {
    SidebarFooter,
    SidebarHeader,
    SidebarNavigationMenu,
    Sidebar as SidebarView,
} from '@/components/sidebar/sidebar';

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
