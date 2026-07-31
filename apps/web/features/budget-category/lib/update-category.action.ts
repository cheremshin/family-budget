'use server';

import { revalidatePath } from 'next/cache';

import z from 'zod';

import { updateCategorySchema } from '@family-budget/domain/budget-category';

import { budgetCategoryService } from '@/lib/budget-category';
import { familyActionClient } from '@/lib/request-context';

export const updateCategoryAction = familyActionClient
    .inputSchema(updateCategorySchema)
    .bindArgsSchemas<[categoryId: z.ZodUUID]>([z.uuidv4()])
    .action(async ({ ctx, parsedInput, bindArgsParsedInputs: [categoryId] }) => {
        await budgetCategoryService.update(ctx.user.id, categoryId, { ...parsedInput });
        revalidatePath('/categories');
    });
