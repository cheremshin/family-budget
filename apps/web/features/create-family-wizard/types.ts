import { FC } from 'react';

import z from 'zod';

import { createFamilySchema } from '@family-budget/domain/family';

export type CreateFamilyForm = z.infer<typeof createFamilySchema>;

export type CreateFamilyStep = {
    title: string;
    description: string;
    content: FC;
    fields: readonly (keyof CreateFamilyForm)[];
    actionStep: boolean;
    allowBack: boolean;
};
