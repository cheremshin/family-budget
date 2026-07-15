'use server';

import { familyService } from '@/lib/family';
import { authenticatedActionClient } from '@/lib/request-context';
import { createFamilySchema } from '@family-budget/domain/family';

export const createFamilyAction = authenticatedActionClient
    .inputSchema(createFamilySchema)
    .action(async ({ ctx, parsedInput }) => {
        return familyService.create(ctx.user.id, { ...parsedInput });
    });
