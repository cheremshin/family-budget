import z from 'zod/v3';

export const createFamilySchema = z.object({
    name: z.string().min(3, {
        message: 'Название семьи должно быть длиной хотя бы 3 символа',
    }),
});
