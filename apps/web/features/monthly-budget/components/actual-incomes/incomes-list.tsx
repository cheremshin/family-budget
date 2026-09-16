import { FC } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    cn,
} from '@family-budget/ui';

import { ReceiptRow } from './actual-incomes.view';

type IncomesListT = {
    rows: ReceiptRow[];
    onSelect: (receiptId: string) => void;
};

export const IncomesList: FC<IncomesListT> = ({ rows, onSelect }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-25">Дата поступления</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow
                        key={row.id}
                        onClick={() => onSelect(row.id)}
                        className={cn('cursor-pointer', row.isSelected && 'bg-accent')}
                    >
                        <TableCell>{row.receivedAt}</TableCell>
                        <TableCell className="text-right">{row.amount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
