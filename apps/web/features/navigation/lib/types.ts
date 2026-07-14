import { NavigationItem } from '@/components/sidebar/types';
import { LucideIcon } from 'lucide-react';

export type NavigationConfig = {
    title: string;
    icon: LucideIcon;
    items: NavigationItem[];
};
