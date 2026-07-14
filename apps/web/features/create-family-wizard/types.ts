import { BudgetDivisionType } from '@family-budget/database';
import { FC } from 'react';

export type CreateFamilyForm = {
    name: string;
    budgetDivisionType: BudgetDivisionType;
};

export type CreateFamilyStep = {
    title: string;
    description: string;
    content: FC;
    fields: readonly (keyof CreateFamilyForm)[];
    actionStep: boolean;
    allowBack: boolean;
};
