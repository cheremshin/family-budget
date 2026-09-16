'use server';

import { revalidatePath } from 'next/cache';

import z from 'zod';

import { familyActionClient } from '@/client/request-context';
import { budgetCategoryService } from '@/lib/budget-category';

export const archiveCategoryAction = familyActionClient
    .bindArgsSchemas<[categoryId: z.ZodUUID]>([z.uuidv4()])
    .action(async ({ ctx, bindArgsParsedInputs: [categoryId] }) => {
        await budgetCategoryService.archive(ctx.user.id, categoryId);
        revalidatePath('/categories');
    });
