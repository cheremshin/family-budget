import { Period } from '@family-budget/domain/shared';

export type MonthCell = {
    period: Period;
    label: string;
    isSelected: boolean;
    isCurrent: boolean;
};

export type DateView = {
    label: string;
    isLoading: boolean;
    isOpen: boolean;
    year: string;
    months: MonthCell[];
};
