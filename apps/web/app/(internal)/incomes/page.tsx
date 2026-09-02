import { loadBudgetData } from '@/app/(internal)/incomes/_lib/budget.loader';
import {
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';
import { MonthlyBudget } from '@/features/monthly-budget/monthly-budget';

export default async function Page() {
    const { userId, familyId, monthlyBudget } = await loadBudgetData();

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
                <MonthlyBudget
                    familyId={familyId}
                    currentUserId={userId}
                    initialData={{ monthlyBudget }}
                />
            </PageContent>
        </PageContainer>
    );
}
