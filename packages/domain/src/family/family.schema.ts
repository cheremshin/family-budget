import z from 'zod';
import { budgetDivisionTypeOptions } from './family.types';

export const familySettingsFieldsSchema = z.object({
    budgetDivisionType: z.enum(budgetDivisionTypeOptions),
});

export const familyFieldsSchema = z.object({
    name: z.string().trim().min(1, 'Название обязательно').max(128),
    maxMembers: z.number().gte(2),
});

export const createFamilySchema = familyFieldsSchema
    .omit({ maxMembers: true })
    .extend(familySettingsFieldsSchema.shape);

export const updateFamilySchema = familyFieldsSchema
    .extend(familySettingsFieldsSchema.shape)
    .partial();

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;
