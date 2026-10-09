import { requireUser } from '@/client/request-context';
import { familyService } from '@/lib/family';

export async function acceptInvite(invitationCode: string) {
    const user = await requireUser();
    await familyService.acceptInvite(user.id, invitationCode);
}
