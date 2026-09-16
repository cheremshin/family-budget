import { authenticatedActionClient } from './authenticated-action-client';
import { NoFamilyYetError } from '@family-budget/domain/family';

export const familyActionClient = authenticatedActionClient.use(async ({ next, ctx }) => {
    if (!ctx.family) {
        throw new NoFamilyYetError();
    }

    return next({
        ctx: {
            ...ctx,
            family: ctx.family,
        },
    });
});
