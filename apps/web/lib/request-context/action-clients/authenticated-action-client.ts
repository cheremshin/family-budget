import { returnServerError } from 'next-safe-action';
import { actionClient } from './action-client';
import { ServerError } from '@family-budget/domain/shared';

export const authenticatedActionClient = actionClient.use(async ({ next, ctx }) => {
    if (!ctx.session || !ctx.user) {
        returnServerError<ServerError>({ code: 'unauthorized', message: 'Сессия истекла. Войдите снова' })
    }

    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
            user: ctx.user,
        },
    });
});
