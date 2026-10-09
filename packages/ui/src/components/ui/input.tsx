import * as React from 'react';

import { CalendarIcon } from 'lucide-react';

import { cn } from '../../lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = 'Input';

type DateInputProps = React.ComponentProps<typeof Input>;

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type="date"
                    className={cn(
                        'pr-10 [&::-webkit-calendar-picker-indicator]:absolute',
                        '[&::-webkit-calendar-picker-indicator]:inset-0',
                        '[&::-webkit-calendar-picker-indicator]:h-full',
                        '[&::-webkit-calendar-picker-indicator]:w-full',
                        '[&::-webkit-calendar-picker-indicator]:opacity-0',
                        '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
                        className,
                    )}
                    {...props}
                />
                <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
        );
    },
);
DateInput.displayName = 'DateInput';

export { Input, DateInput };
