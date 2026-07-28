import { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { type FamilySettingsSchema, familySettingsSchema } from '../lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, FieldError, FieldGroup, FieldLabel, Input } from '@ui/index';
import { BudgetDivisionTypeField } from '@/components/forms/budget-divison-type-field';
import { saveSettingsAction } from '../lib/save-settings.action';

type PropsT = {
    currentSettings: FamilySettingsSchema;
};

export const FamilySettingsForm: FC<PropsT> = ({ currentSettings }) => {
    const form = useForm<FamilySettingsSchema>({
        resolver: zodResolver(familySettingsSchema),
        defaultValues: currentSettings,
    });
    const {
        register,
        formState: { errors, isDirty, isSubmitting },
    } = form;

    const onSubmit = async (data: FamilySettingsSchema) => {
        await saveSettingsAction(form.getValues());
        form.reset(data);
    };

    return (
        <FormProvider {...form}>
            <form
                id="form-family-settings"
                className="flex w-full flex-col gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="form-family-settings-name">Название семьи</FieldLabel>
                        <Input
                            {...register('name')}
                            id="form-family-settings-name"
                            placeholder="Введите название семьи"
                        />
                        {errors.name && <FieldError errors={[errors.name]} />}
                    </Field>
                    <BudgetDivisionTypeField<FamilySettingsSchema>
                        formId="form-family-settings"
                        name="budgetDivisionType"
                        label="Стратегия деления бюджета"
                    />
                </FieldGroup>
            </form>
            {isDirty && (
                <Button
                    type="submit"
                    form="form-family-settings"
                    disabled={isSubmitting}
                    className="w-full mt-4"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            )}
        </FormProvider>
    );
};
