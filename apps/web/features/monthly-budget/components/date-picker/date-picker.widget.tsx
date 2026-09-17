import { FC } from 'react';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import {
    Button,
    Card,
    CardContent,
    Popover,
    PopoverContent,
    PopoverTrigger,
    cn,
} from '@family-budget/ui';

import { DateStore } from './date-picker.store';

type DatePickerWidgetT = {
    store: DateStore;
    className?: string;
};

export const DatePickerWidget: FC<DatePickerWidgetT> = observer(({ store, className }) => {
    const { view } = store;

    return (
        <Card className={className}>
            <CardContent className="flex items-center justify-between gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={store.goToPrevious}
                    aria-label="Предыдущий месяц"
                    className="rounded-xl"
                >
                    <ChevronLeft />
                </Button>

                <Popover open={view.isOpen} onOpenChange={store.setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="min-w-52 justify-center"
                            disabled={view.isLoading}
                        >
                            <CalendarDays />
                            {view.label}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-64 p-3" align="center">
                        <div className="mb-3 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => store.shiftYear(-1)}
                                aria-label="Предыдущий год"
                            >
                                <ChevronLeft />
                            </Button>
                            <span className="text-sm font-medium tabular-nums">{view.year}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => store.shiftYear(1)}
                                aria-label="Следующий год"
                            >
                                <ChevronRight />
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                            {view.months.map((m) => (
                                <Button
                                    key={m.period}
                                    size="sm"
                                    variant={m.isSelected ? 'default' : 'ghost'}
                                    className={cn(
                                        'capitalize',
                                        m.isCurrent && !m.isSelected && 'ring-1 ring-primary/40',
                                    )}
                                    onClick={() => store.selectMonth(m.period)}
                                >
                                    {m.label.replace('.', '')}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={store.goToNext}
                    aria-label="Следующий месяц"
                    className="rounded-xl"
                >
                    <ChevronRight />
                </Button>
            </CardContent>
        </Card>
    );
});
