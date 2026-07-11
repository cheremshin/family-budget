import { requireAuth } from '@/guards/require-auth';
import { familyService } from '@/lib/family';

export async function acceptInvite(invitationCode: string) {
    const { user } = await requireAuth();
    await familyService.acceptInvite(user.id, invitationCode);
}
