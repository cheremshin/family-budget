import { ClientError } from './client-error';
import type { CommandResult } from './run-command';

/** Запрет возвращается тем же CommandResult, что и серверная ошибка без похода на сервер */
export function guarded<T>(
    lock: { message: string } | null,
    run: () => Promise<CommandResult<T>>,
): Promise<CommandResult<T>> {
    return lock
        ? Promise.resolve({ ok: false, error: new ClientError('domain', lock.message) })
        : run();
}
