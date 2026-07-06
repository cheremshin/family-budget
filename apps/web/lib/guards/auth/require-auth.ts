import { container } from '@/lib/container';
import { requireSession } from './require-session';
import { AuthContext } from './types';
import { mapToUserBase } from '@/lib/infrastructure/user.repository';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const requireAuth = cache(async (): Promise<AuthContext> => {
    const session = await requireSession();

    const { userRepository } = container.repositories;
    const { sessionService } = container.services;

    const user = await userRepository.findById(session.userId);
    if (!user) {
        sessionService.invalidateSession();
        redirect('/auth/sign-in');
    }

    return {
        session,
        user: mapToUserBase(user),
    };
});
