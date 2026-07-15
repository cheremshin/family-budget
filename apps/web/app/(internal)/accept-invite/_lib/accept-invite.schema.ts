import z from 'zod';

export const formSchema = z.object({
    code: z.string().length(8, {
        message: 'Код-приглашение состоит из 8 символов',
    }),
});
