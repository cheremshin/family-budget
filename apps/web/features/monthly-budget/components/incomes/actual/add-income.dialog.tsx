import { FC, useState } from 'react';

import { Plus } from 'lucide-react';

import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@family-budget/ui';

import { IncomeFields } from '../../../budget.view';
import { IncomeReceiptForm } from './income-receipt.form';

type PropsT = {
    onSubmit: (input: IncomeFields) => Promise<unknown>;
};

export const AddIncomeDialog: FC<PropsT> = ({ onSubmit }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-dashed">
                    <Plus />
                    Добавить поступление
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Добавить поступление</DialogTitle>
                </DialogHeader>
                <IncomeReceiptForm
                    onSubmit={async (values) => {
                        try {
                            await onSubmit(values);
                            setOpen(false);
                        } catch {
                            /** TO-DO */
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};
