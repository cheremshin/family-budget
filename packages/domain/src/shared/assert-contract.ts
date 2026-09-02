import z from 'zod';

/**
 * Проверяет, что значение действительно соответствует контракту, которым оно типизировано.
 *
 * Нужно на выходе мапперов
 */
export function assertContract<T>(schema: z.ZodType<T>, value: T, label: string): T {
    if (process.env.NODE_ENV === 'production') {
        return value;
    }

    const result = schema.safeParse(value);

    if (!result.success) {
        throw new Error(`[contract] ${label}\n${z.prettifyError(result.error)}`);
    }

    return value;
}
