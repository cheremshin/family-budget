import { cache } from 'react';

import { getFamily } from '@/lib/family';
import { sessionService } from '@/lib/session';
import { getUser } from '@/lib/user';

import { RequestContext } from './types';

export const getRequestContext = cache(async (): Promise<RequestContext> => {
    const session = await sessionService.get();

    if (!session) {
        return {
            session: null,
            user: null,
            family: null,
        };
    }

    const user = await getUser(session.userId);

    // user blocked/deleted but session still exists
    if (!user) {
        sessionService.invalidate();
        return {
            session: null,
            user: null,
            family: null,
        };
    }

    if (!user.familyId) {
        return {
            session,
            user,
            family: null,
        };
    }

    const family = await getFamily(user.familyId);

    if (!family) {
        throw new Error('Family not found');
    }

    return {
        session,
        user,
        family,
    };
});
