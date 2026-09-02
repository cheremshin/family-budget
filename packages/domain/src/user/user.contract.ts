import z from 'zod';

export const authenticatedUserSchema = z.object({
    id: z.uuid(),
    username: z.string().min(1),
    familyId: z.uuid().nullable(),
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
