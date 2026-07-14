'use client';

import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { formSchema } from '../_lib/accept-invite.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod/v3';
import { acceptInviteAction } from '../_lib/accept-invite.action';
import { Button, Field, FieldError, FieldGroup, FieldLabel, Input } from '@ui/index';
import { useRouter, useSearchParams } from 'next/navigation';

type PropsT = {
    initialError?: string;
};

export const AcceptInviteForm: FC<PropsT> = ({ initialError }) => {
    const searchParams = useSearchParams();
    const initialCode = searchParams.get('code') ?? '';

    const router = useRouter();
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
        defaultValues: { code: initialCode },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const result = await acceptInviteAction({ invitationCode: data.code });
        if (!result.success) {
            setError('form', {
                message: result.message,
            });
            return;
        }

        router.replace('/home');
    }

    useEffect(() => {
        if (initialError) {
            setError('form', {
                message: initialError,
            });
        }
    }, [initialError, setError]);

    return (
        <>
            <form id="form-accept-invite" onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="code"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Код</FieldLabel>
                                <Input
                                    {...field}
                                    id="form-accept-invite-code"
                                    placeholder="Введите 8-значный код"
                                    autoComplete="off"
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Field>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Вступление...' : 'Вступить'}
                        </Button>
                    </Field>
                    {formError && <FieldError errors={[formError]} />}
                </FieldGroup>
            </form>
        </>
    );
};
