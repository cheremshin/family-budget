import { FC, useId } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { incomeFieldsSchema } from '@family-budget/domain/monthly-budget';
import { toIsoDate } from '@family-budget/domain/shared';
import {
    Button,
    DateInput,
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@family-budget/ui';

import { CommandResult } from '@/client/core';
import { applyCommandError } from '@/components/forms/apply-command-error';
import { MoneyField } from '@/components/forms/money-field';

import { IncomeReceiptFormValues } from './actual-incomes.form';

type AddIncomeDialogT = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (input: IncomeReceiptFormValues) => Promise<CommandResult>;
};

export const AddIncomeDialog: FC<AddIncomeDialogT> = ({ open, onOpenChange, onSubmit }) => {
    const formId = useId();
    const defaultValues = { amount: '', receivedAt: toIsoDate(new Date()) };
    const form = useForm<IncomeReceiptFormValues>({
        resolver: zodResolver(incomeFieldsSchema),
        defaultValues,
    });
    const {
        register,
        formState: { isSubmitting, errors },
    } = form;

    const handleSubmit = form.handleSubmit(async (values) => {
        const result = await onSubmit(values);

        if (!result.ok) {
            applyCommandError(form, result.error);
            return;
        }

        form.reset(defaultValues);
        onOpenChange(false);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Добавить поступление</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form id={formId} onSubmit={handleSubmit} className="">
                        <FieldGroup>
                            <MoneyField<IncomeReceiptFormValues>
                                formId={formId}
                                name="amount"
                                label="Сумма"
                                placeholder="0"
                            />
                            <Field>
                                <FieldLabel htmlFor={`${formId}-receivedAt`}>
                                    Дата поступления
                                </FieldLabel>
                                <DateInput
                                    {...register('receivedAt')}
                                    id={`${formId}-receivedAt`}
                                    placeholder="Например, сегодня"
                                    type="date"
                                    className="justify-between"
                                />
                                {errors.receivedAt && <FieldError errors={[errors.receivedAt]} />}
                            </Field>
                            {errors.root && <FieldError errors={[errors.root]} />}
                        </FieldGroup>
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Отмена
                                </Button>
                            </DialogClose>
                            <Button type="submit" form={formId} disabled={isSubmitting}>
                                {isSubmitting ? 'В процессе...' : 'Добавить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
};
