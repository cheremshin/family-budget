import z from 'zod';

import { budgetDivisionTypeOptions } from './family.enums';

// вход

const familySettingsFieldsSchema = z.object({
    budgetDivisionType: z.enum(budgetDivisionTypeOptions),
});

const familyFieldsSchema = z.object({
    name: z.string().trim().min(1, 'Название обязательно').max(128),
    maxMembers: z.number().int().gte(2),
});

export const createFamilySchema = familyFieldsSchema
    .omit({ maxMembers: true })
    .extend(familySettingsFieldsSchema.shape);

export const updateFamilySchema = familyFieldsSchema
    .extend(familySettingsFieldsSchema.shape)
    .partial();

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;

// выход

export const familySettingsSchema = familySettingsFieldsSchema;

export const familyMemberSchema = z.object({
    id: z.uuid(),
    username: z.string().min(1),
});

export const familySchema = familyFieldsSchema.extend({
    id: z.uuid(),
    invitationCode: z.string().regex(/^[A-Z0-9]{8}$/),
    ownerId: z.uuid(),
    settings: familySettingsSchema,
    members: z.array(familyMemberSchema),
});

export type FamilySettings = z.infer<typeof familySettingsSchema>;
export type FamilyMember = z.infer<typeof familyMemberSchema>;
export type Family = z.infer<typeof familySchema>;
