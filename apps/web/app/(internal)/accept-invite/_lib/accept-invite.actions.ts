'use server';

import { FamilyError } from '@/lib/services/family-management.service';
import { acceptInvite } from './accept-invite';

export const acceptInviteAction = async (data: { invitationCode: string }) => {
    try {
        await acceptInvite(data.invitationCode);
        return {
            success: true,
        };
    } catch (error) {
        if (error instanceof FamilyError) {
            return {
                success: false,
                message: error.message,
            };
        }

        return {
            success: false,
            message: 'Внутренняя ошибка сервера',
        };
    }
};
