import { createSafeActionClient } from 'next-safe-action';

import { getRequestContext } from '../get-request-context';

export const actionClient = createSafeActionClient().use(async ({ next }) => {
    return next({
        ctx: await getRequestContext(),
    });
});
