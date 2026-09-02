import { FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { plannedIncomeFieldsSchema } from '@family-budget/domain/monthly-budget';
import { Button } from '@family-budget/ui';

import { MoneyField } from '@/components/forms/money-field';

type PlannedIncomeFormValues = z.infer<typeof plannedIncomeFieldsSchema>;

type PropsT = {
    onSubmit: (values: PlannedIncomeFormValues) => void | Promise<unknown>;
    defaultValues?: PlannedIncomeFormValues;
};

export const PlannedIncomeForm: FC<PropsT> = ({ defaultValues, onSubmit }) => {
    const form = useForm<PlannedIncomeFormValues>({
        resolver: zodResolver(plannedIncomeFieldsSchema),
        defaultValues: defaultValues ?? { amount: '' },
    });
    const {
        formState: { isSubmitting },
    } = form;

    return (
        <FormProvider {...form}>
            <form
                id="form-planned-incomes"
                className="flex w-full flex-col gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <MoneyField<PlannedIncomeFormValues>
                    formId="form-planned-incomes"
                    name="amount"
                    label="Ожидаемый доход"
                    placeholder="Сумма в рублях"
                />
                <Button type="submit" form="form-planned-incomes" disabled={isSubmitting}>
                    {isSubmitting ? 'В процессе...' : 'Зафиксировать сумму'}
                </Button>
            </form>
        </FormProvider>
    );
};
