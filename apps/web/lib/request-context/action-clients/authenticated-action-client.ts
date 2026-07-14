import { actionClient } from './action-client';

export const authenticatedActionClient = actionClient.use(async ({ next, ctx }) => {
    if (!ctx.session || !ctx.user) {
        throw new Error('Unauthorized');
    }

    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
            user: ctx.user,
        },
    });
});
