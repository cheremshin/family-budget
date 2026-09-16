import { FC, useId } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';

import { plannedIncomeFieldsSchema } from '@family-budget/domain/monthly-budget';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    FieldError,
} from '@family-budget/ui';

import { CommandResult } from '@/client/core';
import { applyCommandError } from '@/components/forms/apply-command-error';
import { MoneyField } from '@/components/forms/money-field';

import { PlannedIncomeFormValues } from '../planned-income.form';

type PlanSetupCardT = {
    onSubmit: (values: PlannedIncomeFormValues) => Promise<CommandResult>;
    className?: string;
};

export const PlanSetupCard: FC<PlanSetupCardT> = ({ onSubmit, className }) => {
    const formId = useId();
    const form = useForm<PlannedIncomeFormValues>({
        resolver: zodResolver(plannedIncomeFieldsSchema),
        defaultValues: { amount: '' },
    });
    const {
        formState: { isSubmitting, errors },
    } = form;

    const handleSubmit = form.handleSubmit(async (values) => {
        const result = await onSubmit(values);
        if (!result.ok) applyCommandError(form, result.error);
    });

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex gap-2 text-lg">
                    <Wallet />
                    Установить план
                </CardTitle>
                <CardDescription>Укажите сумму, которую заработаете в этом месяце</CardDescription>
            </CardHeader>
            <CardContent>
                <FormProvider {...form}>
                    <form id={formId} className="flex w-full gap-4" onSubmit={handleSubmit}>
                        <MoneyField<PlannedIncomeFormValues>
                            formId={formId}
                            name="amount"
                            placeholder="Сумма в рублях"
                        />
                        <Button type="submit" form={formId} disabled={isSubmitting}>
                            {isSubmitting ? 'В процессе...' : 'Установить'}
                        </Button>
                    </form>
                </FormProvider>
                {errors.root && <FieldError errors={[errors.root]} />}
            </CardContent>
        </Card>
    );
};
