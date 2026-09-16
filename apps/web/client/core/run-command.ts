import { ClientError, toClientError } from './client-error';

export type CommandResult = { ok: true } | { ok: false; error: ClientError };

export async function runCommand(command: () => Promise<unknown>): Promise<CommandResult> {
    try {
        await command();
        return { ok: true };
    } catch (error) {
        return { ok: false, error: toClientError(error) };
    }
}
