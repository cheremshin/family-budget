import { Loader2Icon } from 'lucide-react';

import { cn } from '../../lib/utils';

type SpinnerProps = React.ComponentProps<typeof Loader2Icon> & {
    delayMs?: number;
};

function Spinner({ className, delayMs = 0, ...props }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label="Загрузка"
            className="inline-flex"
            style={
                delayMs > 0
                    ? { animation: `spinner-appear 150ms ease-in ${delayMs}ms both` }
                    : undefined
            }
        >
            <Loader2Icon aria-hidden className={cn('size-4 animate-spin', className)} {...props} />
        </span>
    );
}

export { Spinner };
