'use client';

import { FC } from 'react';

import { Family } from '@family-budget/domain/family';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@family-budget/ui';

import { FamilySettingsForm } from './components/family-settings.form';

type PropsT = {
    family: Family;
};

export const FamilySettings: FC<PropsT> = ({ family }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Основное</CardTitle>
                <CardDescription>
                    Измененные настройки применятся для всех последующих месяцев и текущего, если он
                    не закрыт.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FamilySettingsForm
                    currentSettings={{
                        name: family.name,
                        budgetDivisionType: family.settings.budgetDivisionType,
                    }}
                />
            </CardContent>
        </Card>
    );
};
