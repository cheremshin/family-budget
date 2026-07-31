import { FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@ui/components/ui/select';
import {
    Button,
    DialogClose,
    DialogFooter,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    Input,
} from '@ui/index';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { CategoryFormValues, categoryFormSchema } from '@family-budget/domain/budget-category';

import { MoneyField } from '@/components/forms/money-field';
import { calculationModeLabels } from '@/lib/i18n/ru/calculation-mode';
import { categoryTypeLabels } from '@/lib/i18n/ru/category-type';

type PropsT = {
    defaultValues?: CategoryFormValues;
    onSubmit: (values: CategoryFormValues) => void;
    isSystem?: boolean;
};

export const CategoryForm: FC<PropsT> = ({ defaultValues, isSystem, onSubmit }) => {
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: defaultValues ?? {
            name: '',
            type: 'expense',
            calculationMode: 'absolute',
            targetAmount: '',
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isDirty },
    } = form;

    const calculationMode = useWatch({
        control,
        name: 'calculationMode',
    });

    return (
        <FormProvider {...form}>
            <form
                id="form-category"
                className="flex w-full flex-col gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="form-category-name">Название</FieldLabel>
                        <Input
                            {...register('name')}
                            id="form-category-name"
                            placeholder="Например, продукты"
                        />
                        {errors.name && <FieldError errors={[errors.name]} />}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form-category-type">Тип категории</FieldLabel>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isSystem}
                                >
                                    <SelectTrigger id="form-category-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="expense">
                                            {categoryTypeLabels.expense}
                                        </SelectItem>
                                        <SelectItem value="savings">
                                            {categoryTypeLabels.savings}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {isSystem && (
                            <p className="text-xs text-muted-foreground">
                                Тип системной категории изменить нельзя
                            </p>
                        )}
                        {errors.type && <FieldError errors={[errors.type]} />}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form-category-calculation-mode">
                            Способ расчета
                        </FieldLabel>
                        <Controller
                            control={control}
                            name="calculationMode"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="form-category-calculation-mode">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="absolute">
                                            {calculationModeLabels.absolute}
                                        </SelectItem>
                                        <SelectItem value="relative">
                                            {calculationModeLabels.relative}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.calculationMode && <FieldError errors={[errors.calculationMode]} />}
                    </Field>
                    <MoneyField<CategoryFormValues>
                        formId="form-category"
                        name="targetAmount"
                        label={calculationMode === 'relative' ? 'Целевой процент' : 'Целевая сумма'}
                        placeholder={calculationMode === 'relative' ? '10%' : '15000'}
                    />
                </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Отмена
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="form-category" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </form>
        </FormProvider>
    );
};
