import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { ClientError } from '@/client/core';

export function applyCommandError<T extends FieldValues>(
    form: UseFormReturn<T>,
    error: ClientError,
): void {
    const fields = Object.entries(error.fieldErrors).filter(
        (entry): entry is [string, string[]] => (entry[1]?.length ?? 0) > 0,
    );

    if (error.kind === 'validation' && fields.length > 0) {
        for (const [field, [message]] of fields) {
            form.setError(field as Path<T>, { message });
        }
        return;
    }

    form.setError('root', { message: error.message });
}
