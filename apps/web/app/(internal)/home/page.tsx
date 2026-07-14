import {
    PageContainer,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';
import { requireFamily } from '@/lib/request-context';

export default async function Page() {
    await requireFamily();

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Обзор</PageTitle>
                    <PageDescription>
                        Добро пожаловать в финансовый центр вашей семьи
                    </PageDescription>
                </PageHeaderContent>
            </PageHeader>
        </PageContainer>
    );
}
