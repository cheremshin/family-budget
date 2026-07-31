import z from 'zod';

import { updateFamilySchema } from '@family-budget/domain/family';

export const familySettingsSchema = updateFamilySchema.omit({ maxMembers: true }).required();
export type FamilySettingsSchema = z.infer<typeof familySettingsSchema>;
