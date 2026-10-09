import { formatDateWide, formatMonthShort } from '@/lib/i18n';
import { Period, shiftPeriod } from '@family-budget/domain/shared';

export type MonthCell = {
    period: Period;
    label: string;
    isSelected: boolean;
    isCurrent: boolean;
};

export type MonthPickerView = {
    label: string;
    year: string;
    isOpen: boolean;
    previous: Period;
    next: Period;
    months: MonthCell[];
};

type ViewInput = {
    value: Period;
    today: Period;
    isOpen: boolean;
    yearStart: Period;
};

export function buildMonthPickerView({
    value,
    today,
    isOpen,
    yearStart,
}: ViewInput): MonthPickerView {
    return {
        label: formatDateWide(value),
        year: yearStart.slice(0, 4),
        isOpen,
        previous: shiftPeriod(value, -1),
        next: shiftPeriod(value, 1),
        months: Array.from({ length: 12 }, (_, i) => {
            const period = shiftPeriod(yearStart, i);
            return {
                period,
                label: formatMonthShort(period).replace('.', ''),
                isSelected: period === value,
                isCurrent: period === today,
            };
        }),
    };
}
