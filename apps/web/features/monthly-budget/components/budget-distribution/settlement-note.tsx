import { FC } from 'react';

import { ArrowRight } from 'lucide-react';

import { SettlementView } from './budget-distribution.view';

type SettlementNoteT = {
    settlement: NonNullable<SettlementView>;
};

export const SettlementNote: FC<SettlementNoteT> = ({ settlement }) => (
    <div className="flex items-center justify-between gap-4 rounded-md bg-accent p-4">
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
                {settlement.isViewerDebtor ? 'Вам нужно перевести' : 'Вам переведут'}
            </span>
            <span className="flex items-center gap-2 font-medium">
                {settlement.debtorName}
                <ArrowRight className="size-4 text-primary" />
                {settlement.creditorName}
            </span>
        </div>
        <span className="text-lg font-bold tabular-nums text-primary">{settlement.amount}</span>
    </div>
);
