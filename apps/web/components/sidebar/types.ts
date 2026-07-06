import { LucideIcon } from 'lucide-react';

export type NavigationItem = {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    isActive?: boolean;
};
