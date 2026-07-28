'use server';

import { budgetCategoryService } from '@/lib/budget-category';
import { familyActionClient } from '@/lib/request-context';
import { revalidatePath } from 'next/cache';
import z from 'zod';

export const archiveCategoryAction = familyActionClient
    .bindArgsSchemas<[categoryId: z.ZodUUID]>([z.uuidv4()])
    .action(async ({ ctx, bindArgsParsedInputs: [categoryId] }) => {
        await budgetCategoryService.archive(ctx.user.id, categoryId);
        revalidatePath('/categories');
    });
