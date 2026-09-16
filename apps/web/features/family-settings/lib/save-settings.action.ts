'use server';

import { revalidatePath } from 'next/cache';

import { updateFamilySchema } from '@family-budget/domain/family';

import { familyActionClient } from '@/client/request-context';
import { familyService } from '@/lib/family';

export const saveSettingsAction = familyActionClient
    .inputSchema(updateFamilySchema)
    .action(async ({ ctx, parsedInput }) => {
        await familyService.saveSettings(ctx.user.id, { ...parsedInput });
        revalidatePath('/settings');
    });
