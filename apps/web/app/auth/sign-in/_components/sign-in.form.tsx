'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    Input,
} from '@ui/index';
import { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { signInAction } from '../_lib/sign-in.actions';
import Link from 'next/link';

const formSchema = z.object({
    username: z.string().min(6, {
        message: 'Имя пользователя должно быть длиной хотя бы 6 символов',
    }),
    password: z.string().min(6, {
        message: 'Пароль должен быть длиной хотя бы 6 символов',
    }),
});

export const SignInForm: FC = () => {
    const {
        control,
        handleSubmit,
        setError,
        formState: {
            errors: { form: formError },
        },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: '', password: '' },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const result = await signInAction(data);
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
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
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
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Field>
                        <Button type="submit" className="w-full">
                            Вход
                        </Button>
                    </Field>
                    {formError && <FieldError errors={[formError]} />}
                </FieldGroup>
            </form>
            <div className="flex flex-row justify-start items-center">
                <div>Нет аккаунта?</div>
                <Button asChild variant="link">
                    <Link href="/auth/sign-up" className="max-w-24">
                        Регистрация
                    </Link>
                </Button>
            </div>
        </>
    );
};
