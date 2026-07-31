'use server';

import { revalidatePath } from 'next/cache';

import { familyService } from '@/lib/family';
import { familyActionClient } from '@/lib/request-context';

export const refreshInvitationCodeAction = familyActionClient.action(async ({ ctx }) => {
    await familyService.updateInvitationCode(ctx.user.id);
    revalidatePath('/settings');
});
