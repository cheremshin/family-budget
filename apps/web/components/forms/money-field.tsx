'use client';

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { Field, FieldContent, FieldError, FieldLabel, Input } from '@family-budget/ui';

function sanitizeMoneyInput(raw: string, maxIntegerDigits = 10, maxDecimalDigits = 2): string {
    const digitsAndDot = raw.replace(/[^\d.]/g, '');

    const firstDotIndex = digitsAndDot.indexOf('.');
    const value =
        firstDotIndex === -1
            ? digitsAndDot
            : digitsAndDot.slice(0, firstDotIndex + 1) +
              digitsAndDot.slice(firstDotIndex + 1).replace(/\./g, '');

    const [intPart, decimalPart] = value.split('.');
    const trimmedInt = intPart.slice(0, maxIntegerDigits);

    return decimalPart === undefined
        ? trimmedInt
        : `${trimmedInt}.${decimalPart.slice(0, maxDecimalDigits)}`;
}

type PropsT<T extends FieldValues> = {
    formId: string;
    name: Path<T>;
    label?: string;
    placeholder?: string;
};

export function MoneyField<T extends FieldValues>({ formId, name, label, placeholder }: PropsT<T>) {
    const { control } = useFormContext<T>();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field>
                    {label && <FieldLabel htmlFor={`${formId}-${name}`}>{label}</FieldLabel>}
                    <FieldContent>
                        <Input
                            id={`${formId}-${name}`}
                            ref={field.ref}
                            name={field.name}
                            inputMode="decimal"
                            placeholder={placeholder ?? '0.00'}
                            value={field.value ?? ''}
                            onBlur={field.onBlur}
                            onChange={(e) => field.onChange(sanitizeMoneyInput(e.target.value))}
                        />
                    </FieldContent>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}
