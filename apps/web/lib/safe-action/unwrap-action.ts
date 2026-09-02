type ActionResult<T> = {
    data?: T;
    serverError?: string;
    validationErrors?: unknown;
};

export function unwrapAction<T>(result: ActionResult<T> | undefined): T {
    if (!result) {
        throw new Error('Действие не вернуло результат');
    }

    if (result.serverError) {
        throw new Error(result.serverError);
    }

    if (result.validationErrors) {
        throw new Error('Некорректные данные формы');
    }

    return result.data as T;
}
