'use server';

import { createFamilySchema } from '@family-budget/domain/family';

import { familyService } from '@/lib/family';
import { authenticatedActionClient } from '@/lib/request-context';

export const createFamilyAction = authenticatedActionClient
    .inputSchema(createFamilySchema)
    .action(async ({ ctx, parsedInput }) => {
        return await familyService.create(ctx.user.id, { ...parsedInput });
    });
