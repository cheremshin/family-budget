import { getUser } from '@/lib/user';
import { requireSession } from './require-session';
import { AuthContext } from './types';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { sessionService } from '@/lib/session';

export const requireAuth = cache(async (): Promise<AuthContext> => {
    const session = await requireSession();

    const user = await getUser(session.userId);
    if (!user) {
        sessionService.invalidate();
        redirect('/auth/sign-in');
    }

    return {
        session,
        user: {
            id: user.id,
            username: user.username,
            familyId: user.familyId,
        },
    };
});
