'use server';

import { familyService } from '@/lib/family';
import { familyActionClient } from '@/lib/request-context';
import { revalidatePath } from 'next/cache';

export const refreshInvitationCodeAction = familyActionClient.action(async ({ ctx }) => {
    familyService.updateInvitationCode(ctx.family.id);
    revalidatePath('/settings');
});
