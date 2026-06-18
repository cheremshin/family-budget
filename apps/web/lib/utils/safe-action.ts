import { createSafeActionClient } from 'next-safe-action';
import { getSession } from './session';

export const authClient = createSafeActionClient().use(async ({ next }) => {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');
    return next({ ctx: { user: session.user } });
});
