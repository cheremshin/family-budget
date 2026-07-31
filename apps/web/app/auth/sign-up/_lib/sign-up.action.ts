'use server';

import { redirect } from 'next/navigation';

import { AuthError, authService } from '@/lib/auth';
import { sessionService } from '@/lib/session';

export const signUpAction = async (data: { username: string; password: string }) => {
    try {
        console.log('biba');
        const user = await authService.signUp(data);
        await sessionService.create({ userId: user.id });
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: false, message: error.message };
        }

        console.error('signUpAction failed', error);
        return {
            success: false,
            message: 'Внутренняя ошибка сервера. Попробуйте позже',
        };
    }

    redirect('/home');
};
