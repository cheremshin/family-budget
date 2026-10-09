import { ClientError, toClientError } from './client-error';

export type CommandResult<T = unknown> = { ok: true; data: T } | { ok: false; error: ClientError };

export async function runCommand<T>(command: () => Promise<T>): Promise<CommandResult<T>> {
    try {
        return { ok: true, data: await command() };
    } catch (error) {
        return { ok: false, error: toClientError(error) };
    }
}
