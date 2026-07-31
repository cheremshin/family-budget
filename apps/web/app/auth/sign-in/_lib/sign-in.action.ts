'use server';

import { redirect } from 'next/navigation';

import { AuthError, authService } from '@/lib/auth';
import { sessionService } from '@/lib/session';

export const signInAction = async (data: { username: string; password: string }) => {
    try {
        const user = await authService.signIn(data);
        await sessionService.create({ userId: user.id });
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
