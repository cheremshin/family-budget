import {
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderActions,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';
import { CategoryList, CreateCategoryButton } from '@/features/budget-category';

import { loadCategories } from './_lib/categories.loader';

export default async function Page() {
    const categories = await loadCategories();

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Категории</PageTitle>
                    <PageDescription>Управление структурой вашего бюджета</PageDescription>
                </PageHeaderContent>
                <PageHeaderActions>
                    <CreateCategoryButton />
                </PageHeaderActions>
            </PageHeader>
            <PageContent>
                <CategoryList categories={categories} />
            </PageContent>
        </PageContainer>
    );
}
