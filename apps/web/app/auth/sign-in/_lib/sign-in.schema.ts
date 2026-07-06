import z from 'zod/v3';

export const formSchema = z.object({
    username: z.string().min(6, {
        message: 'Имя пользователя должно быть длиной хотя бы 6 символов',
    }),
    password: z.string().min(6, {
        message: 'Пароль должен быть длиной хотя бы 6 символов',
    }),
});
