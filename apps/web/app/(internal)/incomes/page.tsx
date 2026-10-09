import { Suspense } from 'react';

import { dehydrate } from '@tanstack/query-core';

import { PERIOD_PARAM, Period, resolvePeriodParam } from '@family-budget/domain/shared';

import { Viewer, createQueryClient } from '@/client/core';
import { monthlyBudgetPrefetch } from '@/client/monthly-budget/server';
import { requireFamily, requireUser } from '@/client/request-context';
import {
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderActions,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';
import { MonthNavigation } from '@/features/month-navigation';
import { MonthlyBudget, MonthlyBudgetLoading } from '@/features/monthly-budget';
import { getCurrentPeriod } from '@/lib/clock';

import { toViewer } from '../_lib/viewer';

export default async function Page({ searchParams }: PageProps<'/incomes'>) {
    const [user, family] = [await requireUser(), await requireFamily()];
    const viewer = toViewer(user, family);
    const today = getCurrentPeriod();

    const period = resolvePeriodParam((await searchParams)[PERIOD_PARAM], today);

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Доходы</PageTitle>
                    <PageDescription>
                        Планирование и распределение семейного бюджета
                    </PageDescription>
                </PageHeaderContent>
                <PageHeaderActions>
                    <MonthNavigation today={today} />
                </PageHeaderActions>
            </PageHeader>
            <PageContent>
                <Suspense fallback={<MonthlyBudgetLoading />}>
                    <BudgetData viewer={viewer} today={today} period={period} />
                </Suspense>
            </PageContent>
        </PageContainer>
    );
}

async function BudgetData({
    viewer,
    today,
    period,
}: {
    viewer: Viewer;
    today: Period;
    period: Period;
}) {
    const queryClient = createQueryClient();
    await queryClient.prefetchQuery(monthlyBudgetPrefetch(viewer.familyId, period));

    return <MonthlyBudget snapshot={dehydrate(queryClient)} viewer={viewer} today={today} />;
}
