'use client';

import { FC } from 'react';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Period } from '@family-budget/domain/shared';
import { Button, Popover, PopoverContent, PopoverTrigger, cn } from '@family-budget/ui';

import { MonthCell } from './month-picker.view';
import { useMonthPicker } from './use-month-picker';

type MonthPickerProps = {
    value: Period;
    today: Period;
    onChange(period: Period): void;
    className?: string;
};

export const MonthPicker: FC<MonthPickerProps> = ({ className, ...input }) => {
    const { view, actions } = useMonthPicker(input);

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Button
                variant="outline"
                size="icon"
                aria-label="Предыдущий месяц"
                onClick={() => actions.select(view.previous)}
            >
                <ChevronLeft />
            </Button>

            <Popover open={view.isOpen} onOpenChange={actions.setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-52 justify-center">
                        <CalendarDays />
                        {view.label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="center">
                    <YearHeader year={view.year} onShift={actions.shiftYear} />
                    <MonthGrid months={view.months} onSelect={actions.select} />
                </PopoverContent>
            </Popover>

            <Button
                variant="outline"
                size="icon"
                aria-label="Следующий месяц"
                onClick={() => actions.select(view.next)}
            >
                <ChevronRight />
            </Button>
        </div>
    );
};

const YearHeader: FC<{ year: string; onShift(delta: number): void }> = ({ year, onShift }) => (
    <div className="mb-3 flex items-center justify-between">
        <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Предыдущий год"
            onClick={() => onShift(-1)}
        >
            <ChevronLeft />
        </Button>
        <span className="text-sm font-medium tabular-nums">{year}</span>
        <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Следующий год"
            onClick={() => onShift(1)}
        >
            <ChevronRight />
        </Button>
    </div>
);

const MonthGrid: FC<{ months: MonthCell[]; onSelect(period: Period): void }> = ({
    months,
    onSelect,
}) => (
    <div className="grid grid-cols-3 gap-1">
        {months.map((m) => (
            <Button
                key={m.period}
                size="sm"
                variant={m.isSelected ? 'default' : 'ghost'}
                className={cn(
                    'capitalize',
                    m.isCurrent && !m.isSelected && 'ring-1 ring-primary/40',
                )}
                onClick={() => onSelect(m.period)}
            >
                {m.label}
            </Button>
        ))}
    </div>
);
