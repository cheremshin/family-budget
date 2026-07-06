import { Family } from '@/lib/entities/family';
import { FC } from 'react';

export type CreateFamilyForm = {
    name: string;
};

export type CreateFamilyStep = {
    title: string;
    description: string;
    content: FC;
    fields: readonly (keyof CreateFamilyForm)[];
};

export type CreateFamilyResult = Omit<Family, 'members'>;
