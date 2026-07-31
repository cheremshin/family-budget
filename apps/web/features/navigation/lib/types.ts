import { LucideIcon } from 'lucide-react';

import { NavigationItem } from '@/components/sidebar/types';

export type NavigationConfig = {
    title: string;
    icon: LucideIcon;
    items: NavigationItem[];
};
