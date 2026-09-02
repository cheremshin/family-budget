import { DEFAULT_SERVER_ERROR_MESSAGE, createSafeActionClient } from 'next-safe-action';

import { DomainError } from '@family-budget/domain/shared';

import { getRequestContext } from '../get-request-context';

export const actionClient = createSafeActionClient({
    handleServerError(error) {
        if (error instanceof DomainError) {
            return error.message;
        }

        console.error('[action]', error);

        return DEFAULT_SERVER_ERROR_MESSAGE;
    },
}).use(async ({ next }) => {
    return next({
        ctx: await getRequestContext(),
    });
});
