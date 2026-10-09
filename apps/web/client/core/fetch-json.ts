import type { ServerError } from '@family-budget/domain/shared';

import { ClientError, type FieldErrors, UNEXPECTED_MESSAGE, toClientError } from './client-error';

type ErrorBody = Partial<ServerError> & { fieldErrors?: FieldErrors };

/** GET к route handler. Исключение ClientError того же вида, что callAction */
export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    let response: Response;

    try {
        response = await fetch(url, { signal, cache: 'no-store', headers: { accept: 'application/json' } });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw toClientError(error);
    }

    if (response.ok) {
        return (await response.json()) as T;
    }

    const body = (await response.json().catch(() => null)) as ErrorBody | null;

    if (response.status === 422) {
        throw new ClientError('validation', body?.message ?? 'Некорректные данные', body?.fieldErrors ?? {});
    }

    if (body?.code && body.message) {
        throw new ClientError(body.code, body.message);
    }

    throw new ClientError('unexpected', UNEXPECTED_MESSAGE);
}
