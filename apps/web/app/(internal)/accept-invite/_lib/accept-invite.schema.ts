import z from 'zod/v3';

export const formSchema = z.object({
    code: z.string().length(8, {
        message: 'Код-приглашение состоит из 8 символов',
    }),
});
