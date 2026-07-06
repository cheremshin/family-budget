'use server';

import { container } from '@/lib/container';
import { AuthError } from '@/lib/services/auth.service';
import { redirect } from 'next/navigation';

export const signInAction = async (data: {
    username: string;
    password: string;
}) => {
    const { authService, sessionService } = container.services;

    try {
        const user = await authService.signIn(data);
        await sessionService.setSession({ userId: user.id });
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: false, message: error.message };
        }

        console.error('signInAction failed', error);
        return {
            success: false,
            message: 'Внутренняя ошибка сервера. Попробуйте позже',
        };
    }

    redirect('/home');
};
