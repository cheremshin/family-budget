'use server';

import { getServices } from '@/lib/container';
import { SignUpError } from '@/lib/services/auth.service';
import { setSession } from '@/lib/utils/session';

export const signUpAction = async (data: {
    username: string;
    password: string;
}) => {
    try {
        const user = await getServices().auth.signUp(data);
        await setSession(user.id);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof SignUpError
                    ? error.message
                    : 'Внутренняя ошибка сервера. Попробуйте позже',
        };
    }
};
