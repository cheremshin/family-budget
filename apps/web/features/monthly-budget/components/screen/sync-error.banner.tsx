import type { FC } from 'react';

import { RefreshCw, WifiOff } from 'lucide-react';

import { Button } from '@family-budget/ui';

type SyncErrorBannerT = {
    message: string;
    onRetry: () => void;
};

export const SyncErrorBanner: FC<SyncErrorBannerT> = ({ message, onRetry }) => (
    <div className="bg-accent text-accent-foreground flex items-center justify-between gap-4 rounded-md px-4 py-2">
        <span className="flex items-center gap-2 text-sm">
            <WifiOff className="size-4" />
            {message}
        </span>
        <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw />
            Обновить
        </Button>
    </div>
);
