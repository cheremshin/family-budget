'use server';

import { revalidatePath } from 'next/cache';

import { updateFamilySchema } from '@family-budget/domain/family';

import { familyService } from '@/lib/family';
import { familyActionClient } from '@/lib/request-context';

export const saveSettingsAction = familyActionClient
    .inputSchema(updateFamilySchema)
    .action(async ({ ctx, parsedInput }) => {
        await familyService.saveSettings(ctx.user.id, { ...parsedInput });
        revalidatePath('/settings');
    });
