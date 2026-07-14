import { FamilyMembers } from '@/components/family-members';
import {
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/page-layout';
import { FamilyInvitationCode } from '@/features/family-invitation-code/family-invitation-code.widget';
import { FamilySettings } from '@/features/family-settings/family-settings.widget';
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
            <PageContent className="grid grid-cols-2 items-start gap-4 grid-flow-dense">
                <FamilySettings family={family} />
                <FamilyInvitationCode invitationCode={family.invitationCode} />
                <FamilyMembers
                    ownerId={family.ownerId}
                    members={family.members}
                    maxMembers={family.maxMembers}
                />
            </PageContent>
        </PageContainer>
    );
}
