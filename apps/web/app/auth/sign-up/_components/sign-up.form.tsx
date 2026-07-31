'use client';

import { FC } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Field, FieldError, FieldGroup, FieldLabel, Input } from '@family-budget/ui';

import { signUpAction } from '@/app/auth/sign-up/_lib/sign-up.action';
import { formSchema } from '@/app/auth/sign-up/_lib/sign-up.schema';

export const SignUpForm: FC = () => {
    const {
        control,
        handleSubmit,
        setError,
        formState: {
            isSubmitting,
            errors: { form: formError },
        },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: '', password: '' },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const result = await signUpAction(data);
        if (!result.success) {
            setError('form', {
                message: result.message ?? 'Внутренняя ошибка',
            });
        }
    }

    return (
        <>
            <form id="form-sign-up" onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="username"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Имя пользователя</FieldLabel>
                                <Input
                                    {...field}
                                    id="form-sign-up-username"
                                    placeholder="Введите имя пользователя"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="password"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Пароль</FieldLabel>
                                <Input
                                    {...field}
                                    id="form-sign-up-password"
                                    placeholder="Введите пароль"
                                    autoComplete="off"
                                    type="password"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Field>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Регистрация...' : 'Регистрация'}
                        </Button>
                    </Field>
                    {formError && <FieldError errors={[formError]} />}
                </FieldGroup>
            </form>
            <div className="flex flex-row justify-start items-center">
                <div>Уже есть аккаунт?</div>
                <Button asChild variant="link">
                    <Link href="/auth/sign-in" className="max-w-20">
                        Вход
                    </Link>
                </Button>
            </div>
        </>
    );
};
