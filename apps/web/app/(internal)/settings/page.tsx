import { FamilyMembers } from '@/components/family-members';
import {
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';
import { FamilyInvitationCode } from '@/features/family-invitation-code';
import { FamilySettings } from '@/features/family-settings';
import { requireFamily } from '@/lib/request-context';

export default async function Page() {
    const family = await requireFamily();

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Настройки</PageTitle>
                    <PageDescription>Управление семьей и правилами бюджета</PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent className="flex flex-col gap-4 xl:flex-row">
                <div className="flex-1 flex flex-col gap-4">
                    <FamilyMembers
                        ownerId={family.ownerId}
                        members={family.members}
                        maxMembers={family.maxMembers}
                    />
                    <FamilySettings family={family} />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    <FamilyInvitationCode invitationCode={family.invitationCode} />
                </div>
            </PageContent>
        </PageContainer>
    );
}
