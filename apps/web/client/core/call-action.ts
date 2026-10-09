import type { ServerError } from '@family-budget/domain/shared';

import { ClientError, type FieldErrors, UNEXPECTED_MESSAGE, toClientError } from './client-error';

type SafeActionResult<Out> = {
    data?: Out;
    serverError?: ServerError;
    validationErrors?: { formErrors: string[]; fieldErrors: FieldErrors };
};

type SafeAction<In, Out> = (input: In) => Promise<SafeActionResult<Out> | undefined>;

export async function callAction<In, Out>(action: SafeAction<In, Out>, input: In): Promise<Out> {
    let result: SafeActionResult<Out> | undefined;

    try {
        result = await action(input);
    } catch (error) {
        throw toClientError(error);
    }

    if (!result) {
        throw new ClientError('unexpected', UNEXPECTED_MESSAGE);
    }

    if (result.serverError) {
        throw new ClientError(result.serverError.code, result.serverError.message);
    }

    if (result.validationErrors) {
        const { formErrors, fieldErrors } = result.validationErrors;
        throw new ClientError('validation', formErrors[0] ?? 'Некорректные данные', fieldErrors);
    }

    return result.data as Out;
}
