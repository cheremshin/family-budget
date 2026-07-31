import z from 'zod';

import { moneySchema } from '../shared';
import { budgetCategoryTypeOptions, calculationModeOptions } from './budget-category.types';

export const categoryFieldsSchema = z.object({
    name: z.string().trim().min(1, 'Название обязательно').max(128),
    type: z.enum(budgetCategoryTypeOptions),
    calculationMode: z.enum(calculationModeOptions),
    targetAmount: moneySchema,
});

function validateTargetAmount(
    data: { calculationMode?: string; targetAmount?: string },
    ctx: z.RefinementCtx,
) {
    if (data.calculationMode === undefined && data.targetAmount === undefined) return;

    if (data.calculationMode === 'absolute' && Number(data.targetAmount) <= 0) {
        ctx.addIssue({
            code: 'custom',
            path: ['targetAmount'],
            message: 'В фиксированном режиме сумма должна быть больше 0',
        });
    } else if (
        data.calculationMode === 'relative' &&
        (Number(data.targetAmount) < 0 || Number(data.targetAmount) > 100)
    ) {
        ctx.addIssue({
            code: 'custom',
            path: ['targetAmount'],
            message: 'В процентном режиме значение должно быть от 0 до 100',
        });
    }
}

export const categoryFormSchema = categoryFieldsSchema.superRefine(validateTargetAmount);
export const createCategorySchema = categoryFormSchema;
export const updateCategorySchema = categoryFieldsSchema
    .partial()
    .superRefine(validateTargetAmount);

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
