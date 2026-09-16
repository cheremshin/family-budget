import { returnServerError } from 'next-safe-action';
import { authenticatedActionClient } from './authenticated-action-client';
import { ServerError } from '@family-budget/domain/shared';

export const familyActionClient = authenticatedActionClient.use(async ({ next, ctx }) => {
    if (!ctx.family) {
        returnServerError<ServerError>({ code: 'domain', message: 'Сначала создайте семью или присоединитесь к ней' })
    }

    return next({
        ctx: {
            ...ctx,
            family: ctx.family,
        },
    });
});
