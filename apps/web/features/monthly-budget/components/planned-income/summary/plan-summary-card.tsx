import { FC, useId, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';

import { plannedIncomeFieldsSchema } from '@family-budget/domain/monthly-budget';
import {
    Button,
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
    FieldError,
    Progress,
} from '@family-budget/ui';

import { CommandResult } from '@/client/core';
import { applyCommandError } from '@/components/forms/apply-command-error';
import { MoneyField } from '@/components/forms/money-field';

import { PlannedIncomeFormValues } from '../planned-income.form';
import { PlanLockView, PlannedIncomeSummary } from '../planned-income.view';
import { EditControls } from './edit-controls';
import { StatBlock } from './stat-block';

type PlanSummaryCardT = {
    summary: PlannedIncomeSummary;
    lock: PlanLockView;
    onSubmit: (values: PlannedIncomeFormValues) => Promise<CommandResult>;
    className?: string;
};

export const PlanSummaryCard: FC<PlanSummaryCardT> = ({ summary, lock, onSubmit, className }) => {
    const formId = useId();
    const [isEditing, setEditing] = useState(false);
    const form = useForm<PlannedIncomeFormValues>({
        resolver: zodResolver(plannedIncomeFieldsSchema),
        defaultValues: { amount: summary.plannedAmountValue },
    });
    const {
        formState: { isSubmitting, errors },
    } = form;

    const handleEdit = () => {
        form.reset({ amount: summary.plannedAmountValue });
        setEditing(true);
    };

    const handleSubmit = form.handleSubmit(async (values) => {
        const result = await onSubmit(values);

        if (!result.ok) {
            applyCommandError(form, result.error);
            return;
        }

        setEditing(false);
    });

    return (
        <Card className={className}>
            <CardHeader className="flex-row justify-between items-center">
                <CardTitle className="text-lg">План доходов на месяц</CardTitle>
                <CardAction>
                    {lock ? (
                        <Button variant="outline" type="button" disabled title={lock.message}>
                            <Lock />
                            Изменить
                        </Button>
                    ) : (
                        <EditControls
                            formId={formId}
                            isEditing={isEditing}
                            isSubmitting={isSubmitting}
                            onEdit={handleEdit}
                            onCancel={() => setEditing(false)}
                        />
                    )}
                </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 bg-accent rounded-md p-4 gap-3">
                    <StatBlock label="Запланированно">
                        {isEditing ? (
                            <FormProvider {...form}>
                                <form id={formId} onSubmit={handleSubmit}>
                                    <MoneyField<PlannedIncomeFormValues>
                                        formId={formId}
                                        name="amount"
                                        placeholder={summary.plannedAmount}
                                        className="bg-background border-input text-foreground"
                                    />
                                </form>
                            </FormProvider>
                        ) : (
                            <span className="block text-xl font-bold text-primary">
                                {summary.plannedAmount}
                            </span>
                        )}
                    </StatBlock>
                    <StatBlock label="Получено">
                        {summary.received}
                        <span className="text-xs font-normal">({summary.progress}%)</span>
                    </StatBlock>
                </div>
                <Progress value={summary.progress} />
                {lock && <p className="text-muted-foreground text-sm">{lock.message}</p>}
                {errors.root && <FieldError errors={[errors.root]} />}
            </CardContent>
        </Card>
    );
};
