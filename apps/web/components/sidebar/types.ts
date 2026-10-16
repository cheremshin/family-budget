import { Route } from 'next';

import { LucideIcon } from 'lucide-react';

export type NavigationItem = {
    id: string;
    label: string;
    href: Route;
    icon: LucideIcon;
    isActive?: boolean;
};
