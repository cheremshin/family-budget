import { createSafeActionClient } from 'next-safe-action';

import { DomainError, ServerError } from '@family-budget/domain/shared';

import { getRequestContext } from '../get-request-context';

export const actionClient = createSafeActionClient({
    defaultValidationErrorsShape: 'flattened',
    handleServerError(error): ServerError {
        if (error instanceof DomainError) {
            return { code: 'domain', message: error.message };
        }

        console.error('[action]', error);

        return { code: 'unexpected', message: 'Не удалось выполнить операцию. Попробуйте снова' };
    },
}).use(async ({ next }) => {
    return next({
        ctx: await getRequestContext(),
    });
});
