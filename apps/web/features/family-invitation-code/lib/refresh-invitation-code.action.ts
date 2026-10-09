'use server';

import { revalidatePath } from 'next/cache';

import { familyActionClient } from '@/client/request-context';
import { familyService } from '@/lib/family';

export const refreshInvitationCodeAction = familyActionClient.action(async ({ ctx }) => {
    await familyService.updateInvitationCode(ctx.user.id);
    revalidatePath('/settings');
});
