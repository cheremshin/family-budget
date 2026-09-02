'use client';

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { BudgetDivisionType } from '@family-budget/domain/family';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
    RadioGroup,
    RadioGroupItem,
} from '@family-budget/ui';

type BudgetDivisionTypeFieldItem = {
    id: BudgetDivisionType;
    title: string;
    description: string;
};

const types: BudgetDivisionTypeFieldItem[] = [
    {
        id: 'in_half',
        title: 'Поровну',
        description:
            'Все счета (расходы, накопления) делятся на количество членов семьи. Отличный вариант, если доходы каждого сопоставимы',
    },
    {
        id: 'in_proportion',
        title: 'Пропорционально',
        description:
            'Вклад каждого пропорционален его доходу. Отличный вариант, если доходы сильно отличаются',
    },
];

type PropsT<T extends FieldValues> = {
    formId: string;
    name: Path<T>;
    label?: string;
};

export function BudgetDivisionTypeField<T extends FieldValues>({ formId, name, label }: PropsT<T>) {
    const { control } = useFormContext<T>();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FieldSet>
                    <FieldLegend>{label}</FieldLegend>
                    <RadioGroup
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                    >
                        {types.map((item) => (
                            <FieldLabel key={item.id}>
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>{item.title}</FieldTitle>
                                        <FieldDescription>{item.description}</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value={item.id} id={`${formId}-${name}`} />
                                </Field>
                            </FieldLabel>
                        ))}
                    </RadioGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldSet>
            )}
        />
    );
}
