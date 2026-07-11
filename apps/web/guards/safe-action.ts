import { createSafeActionClient } from 'next-safe-action';
import { requireAuth } from './require-auth';

export const authClient = createSafeActionClient().use(async ({ next }) => {
    const auth = await requireAuth();
    return next({
        ctx: auth,
    });
});
