import { FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { incomeFieldsSchema } from '@family-budget/domain/monthly-budget';
import { toIsoDate } from '@family-budget/domain/shared';
import {
    Button,
    DialogClose,
    DialogFooter,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    Input,
} from '@family-budget/ui';

import { MoneyField } from '@/components/forms/money-field';

type IncomeReceiptFormValues = z.infer<typeof incomeFieldsSchema>;

type PropsT = {
    defaultValues?: IncomeReceiptFormValues;
    onSubmit: (values: IncomeReceiptFormValues) => void;
};

export const IncomeReceiptForm: FC<PropsT> = ({ defaultValues, onSubmit }) => {
    const form = useForm<IncomeReceiptFormValues>({
        resolver: zodResolver(incomeFieldsSchema),
        defaultValues: defaultValues ?? {
            amount: '',
            receivedAt: toIsoDate(new Date()),
        },
    });
    const {
        register,
        formState: { errors, isSubmitting },
    } = form;

    return (
        <FormProvider {...form}>
            <form
                id="form-income-receipt"
                className="flex w-full flex-col gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FieldGroup>
                    <MoneyField<IncomeReceiptFormValues>
                        formId="form-income-receipt"
                        name="amount"
                        label="Сумма"
                        placeholder="0"
                    />
                    <Field>
                        <FieldLabel htmlFor="form-income-receipt">Дата поступления</FieldLabel>
                        <Input
                            {...register('receivedAt')}
                            id="form-income-receipt-receivedAt"
                            placeholder="Например, сегодня"
                            type="date"
                            className="max-w-40 justify-between"
                        />
                        {errors.receivedAt && <FieldError errors={[errors.receivedAt]} />}
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Отмена
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="form-income-receipt" disabled={isSubmitting}>
                        {isSubmitting ? 'В процессе...' : 'Добавить'}
                    </Button>
                </DialogFooter>
            </form>
        </FormProvider>
    );
};
