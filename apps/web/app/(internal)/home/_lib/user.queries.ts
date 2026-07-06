'use server';

import { container } from '@/lib/container';
import { User } from '@/lib/entities/user';
import { requireAuth } from '@/lib/guards/auth/require-auth';

export const getCurrentUser = async () => {
    const { user: userBase } = await requireAuth();
    const { familyManagementService } = container.services;

    const family = await familyManagementService.getFamilyByUser(userBase);
    return {
        id: userBase.id,
        username: userBase.username,
        family,
    } as User;
};
