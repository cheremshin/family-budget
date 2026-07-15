import { updateFamilySchema } from '@family-budget/domain/family';
import z from 'zod';

export const familySettingsSchema = updateFamilySchema.omit({ maxMembers: true }).required();
export type FamilySettingsSchema = z.infer<typeof familySettingsSchema>;
