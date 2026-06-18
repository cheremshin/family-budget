'use server';

import { getServices } from '@/lib/container';
import { SignInError } from '@/lib/services/auth.service';
import { setSession } from '@/lib/utils/session';

export const signInAction = async (data: {
    username: string;
    password: string;
}) => {
    try {
        const user = await getServices().auth.signIn(data);
        await setSession(user.id);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof SignInError
                    ? error.message
                    : 'Внутренняя ошибка сервера. Попробуйте позже',
        };
    }
};
