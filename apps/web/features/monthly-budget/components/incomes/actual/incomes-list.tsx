import { FC } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@family-budget/ui';

import { ReceiptRow } from '../../../budget.view';

type PropsT = {
    receipts: ReceiptRow[];
};

export const IncomesList: FC<PropsT> = ({ receipts }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-25">Дата поступления</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                    <TableCell>{receipt.receivedAt}</TableCell>
                    <TableCell className="text-right">{receipt.amount}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);
