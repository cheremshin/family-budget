'use server';

import { revalidatePath } from 'next/cache';

import { createCategorySchema } from '@family-budget/domain/budget-category';

import { familyActionClient } from '@/client/request-context';
import { budgetCategoryService } from '@/lib/budget-category';

export const createCategoryAction = familyActionClient
    .inputSchema(createCategorySchema)
    .action(async ({ ctx, parsedInput }) => {
        await budgetCategoryService.create(ctx.user.id, { ...parsedInput });
        revalidatePath('/categories');
    });
