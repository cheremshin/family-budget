import { container } from '@/lib/container';
import { requireAuth } from '@/lib/guards/auth/require-auth';

export async function acceptInvite(invitationCode: string) {
    const { user } = await requireAuth();
    await container.services.familyManagementService.acceptInvite(
        user,
        invitationCode,
    );
}
