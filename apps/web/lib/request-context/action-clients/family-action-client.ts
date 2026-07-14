import { authenticatedActionClient } from './authenticated-action-client';

export const familyActionClient = authenticatedActionClient.use(async ({ next, ctx }) => {
    if (!ctx.family) {
        throw new Error('Has no family');
    }

    return next({
        ctx: {
            ...ctx,
            family: ctx.family,
        },
    });
});
