'use server';

import { budgetCategoryService } from '@/lib/budget-category';
import { familyActionClient } from '@/lib/request-context';
import { createCategorySchema } from '@family-budget/domain/budget-category';
import { revalidatePath } from 'next/cache';

export const createCategoryAction = familyActionClient
    .inputSchema(createCategorySchema)
    .action(async ({ ctx, parsedInput }) => {
        await budgetCategoryService.create(ctx.user.id, { ...parsedInput });
        revalidatePath('/categories');
    });
