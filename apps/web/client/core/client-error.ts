import { ServerErrorCode } from '@family-budget/domain/shared';

export type ClientErrorKind = ServerErrorCode | 'validation' | 'network';

export type FieldErrors = Record<string, string[] | undefined>;

export const NETWORK_MESSAGE = 'Нет связи с сервером. Проверьте подключение';
export const UNEXPECTED_MESSAGE = 'Что-то пошло не так. Попробуйте еще раз';

export class ClientError extends Error {
    constructor(
        readonly kind: ClientErrorKind,
        message: string,
        readonly fieldErrors: FieldErrors = {},
    ) {
        super(message);
        this.name = 'ClientError';
    }

    get isRetryable(): boolean {
        return this.kind === 'network' || this.kind === 'unexpected';
    }
}

export function toClientError(error: unknown): ClientError {
    if (error instanceof ClientError) return error;
    if (isNetworkFailure(error)) return new ClientError('network', NETWORK_MESSAGE);

    return new ClientError('unexpected', UNEXPECTED_MESSAGE);
}

function isNetworkFailure(error: unknown): boolean {
    return error instanceof TypeError && /fetch|network|load failed/i.test(error.message);
}

// Для Query и Mutation .error - ClientError
declare module '@tanstack/query-core' {
    interface Register {
        defaultError: ClientError;
    }
}
