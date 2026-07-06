'use client';

import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input, Label } from '@ui/index';
import { CreateFamilyForm } from '../../types';

export const NameStep: FC = () => {
    const {
        register,
        formState: { errors },
    } = useFormContext<CreateFamilyForm>();

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="name">Название семьи</Label>
            <Input
                id="name"
                placeholder="Семья Ивановых"
                {...register('name')}
            />
            {errors.name && (
                <p className="text-sm text-destructive">
                    {errors.name.message}
                </p>
            )}
        </div>
    );
};
