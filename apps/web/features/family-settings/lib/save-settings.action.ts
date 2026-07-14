'use server';

import { familyActionClient } from '@/lib/request-context';
import { familySettingsSchema } from './schema';
import { familyService } from '@/lib/family';

export const saveSettingsAction = familyActionClient
    .inputSchema(familySettingsSchema)
    .action(async ({ ctx, parsedInput }) => {
        familyService.saveSettings(ctx.family.id, parsedInput.name, {
            budgetDivisionType: parsedInput.budgetDivisionType,
        });
    });
