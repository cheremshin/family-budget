import { familyService } from '@/lib/family';
import { requireUser } from '@/lib/request-context';

export async function acceptInvite(invitationCode: string) {
    const user = await requireUser();
    await familyService.acceptInvite(user.id, invitationCode);
}
