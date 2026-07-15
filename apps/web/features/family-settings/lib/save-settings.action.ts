'use server';

import { familyActionClient } from '@/lib/request-context';
import { familyService } from '@/lib/family';
import { revalidatePath } from 'next/cache';
import { updateFamilySchema } from '@family-budget/domain/family';

export const saveSettingsAction = familyActionClient
    .inputSchema(updateFamilySchema)
    .action(async ({ ctx, parsedInput }) => {
        familyService.saveSettings(ctx.user.id, { ...parsedInput });
        revalidatePath('/settings');
    });
