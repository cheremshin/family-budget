'use server';

import { createFamilySchema } from '@family-budget/domain/family';

import { authenticatedActionClient } from '@/client/request-context';
import { familyService } from '@/lib/family';

export const createFamilyAction = authenticatedActionClient
    .inputSchema(createFamilySchema)
    .action(async ({ ctx, parsedInput }) => {
        return await familyService.create(ctx.user.id, { ...parsedInput });
    });
