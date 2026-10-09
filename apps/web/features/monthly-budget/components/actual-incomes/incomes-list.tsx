import { FC } from 'react';

import { cn } from '@family-budget/ui';

import { ReceiptRow } from './actual-incomes.view';
import { ChevronRight } from 'lucide-react';

type IncomesListT = {
    rows: ReceiptRow[];
    onSelect: (receiptId: string) => void;
};

export const IncomesList: FC<IncomesListT> = ({ rows, onSelect }) => {
    return (
        <div className="flex flex-col justify-center gap-2">
            <div className="flex justify-between px-4 text-xs text-muted-foreground">
                <span>Дата поступления</span>
                <span>Сумма</span>
            </div>
            {rows.map((row) => (
                <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelect(row.id)}
                    className={cn(
                        'flex justify-between items-center gap-2 px-4 py-3 rounded-lg',
                        row.isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent',
                    )}
                >
                    <span className="font-medium">{row.receivedAt}</span>
                    <span className="flex items-center min-w-0 gap-2">
                        <span className="text-md font-medium">{row.amount}</span>
                        <ChevronRight className="w-5" />
                    </span>
                </button>
            ))}
        </div>
    );
};
