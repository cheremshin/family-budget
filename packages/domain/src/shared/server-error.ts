export type ServerErrorCode = 'domain' | 'unauthorized' | 'unexpected';

export type ServerError = {
    code: ServerErrorCode;
    /** Текст для пользователя */
    message: string;
};
