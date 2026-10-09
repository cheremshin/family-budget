import { requireFamily } from '@/client/request-context';
import {
    PageContainer,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';

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
