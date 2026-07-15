import { createFamilySchema } from '@family-budget/domain/family';
import { FC } from 'react';
import z from 'zod';

export type CreateFamilyForm = z.infer<typeof createFamilySchema>;

export type CreateFamilyStep = {
    title: string;
    description: string;
    content: FC;
    fields: readonly (keyof CreateFamilyForm)[];
    actionStep: boolean;
    allowBack: boolean;
};
