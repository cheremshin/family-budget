import { dehydrate } from '@tanstack/query-core';

import { createQueryClient } from '@/client/core';
import { HydrationBoundary } from '@/client/hydration-boundary';
import { monthlyBudgetPrefetch } from '@/client/monthly-budget';
import { requireFamily, requireUser } from '@/client/request-context';
import {
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';
import { MonthlyBudget } from '@/features/monthly-budget';
import { getCurrentPeriod } from '@/lib/clock';

import { toViewer } from '../_lib/viewer';

export default async function Page() {
    const [user, family] = [await requireUser(), await requireFamily()];
    const viewer = toViewer(user, family);
    const today = getCurrentPeriod();

    const queryClient = createQueryClient();
    await queryClient.prefetchQuery(monthlyBudgetPrefetch(viewer.familyId, today));

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Доходы</PageTitle>
                    <PageDescription>
                        Планирование и распределение семейного бюджета
                    </PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <MonthlyBudget viewer={viewer} today={today} />
                </HydrationBoundary>
            </PageContent>
        </PageContainer>
    );
}
