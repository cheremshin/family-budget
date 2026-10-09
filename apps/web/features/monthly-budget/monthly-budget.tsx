'use client';

import { FC } from 'react';

import type { DehydratedState } from '@tanstack/query-core';

import type { Period } from '@family-budget/domain/shared';

import type { Viewer } from '@/client/core';
import { HydrationBoundary } from '@/client/hydration-boundary';

import { BudgetScopeProvider } from './budget-scope.context';
import { ActualIncomes } from './components/actual-incomes/actual-incomes';
import { BudgetDistribution } from './components/budget-distribution/budget-distribution';
import { CloseMonth } from './components/close-month/close-month';
import { MemberSelect } from './components/member-select/member-select';
import { PlannedIncome } from './components/planned-income/planned-income';
import { BudgetGate } from './components/screen/budget-gate';

type MonthlyBudgetT = {
    snapshot: DehydratedState;
    viewer: Viewer;
    today: Period;
};

export const MonthlyBudget: FC<MonthlyBudgetT> = ({ snapshot, viewer, today }) => (
    <HydrationBoundary state={snapshot}>
        <BudgetScopeProvider viewer={viewer} today={today}>
            <BudgetGate
                main={
                    <>
                        <CloseMonth />
                        <MemberSelect />
                        <PlannedIncome />
                    </>
                }
                aside={
                    <>
                        <ActualIncomes />
                        <BudgetDistribution />
                    </>
                }
            />
        </BudgetScopeProvider>
    </HydrationBoundary>
);
