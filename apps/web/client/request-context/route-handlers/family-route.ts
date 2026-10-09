import { NextResponse } from 'next/server';

import z from 'zod';

import { NoFamilyYetError } from '@family-budget/domain/family';
import { DomainError, type ServerError } from '@family-budget/domain/shared';

import { getRequestContext } from '../get-request-context';
import type { RequestContext } from '../types';

type FamilyContext = RequestContext & {
    user: NonNullable<RequestContext['user']>;
    family: NonNullable<RequestContext['family']>;
};

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const fail = (status: number, body: ServerError) => NextResponse.json(body, { status, headers: NO_STORE });

export function familyRoute<S extends z.ZodType, Out>(
    schema: S,
    handler: (args: { ctx: FamilyContext; input: z.infer<S> }) => Promise<Out>,
) {
    return async (request: Request): Promise<Response> => {
        try {
            const ctx = await getRequestContext();

            if (!ctx.user) {
                return fail(401, { code: 'unauthorized', message: 'Сессия истекла. Войдите снова' });
            }
            if (!ctx.family) throw new NoFamilyYetError();

            const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
            if (!parsed.success) {
                const { formErrors, fieldErrors } = z.flattenError(parsed.error);
                return NextResponse.json(
                    { code: 'validation', message: formErrors[0] ?? 'Некорректные данные', fieldErrors },
                    { status: 422, headers: NO_STORE },
                );
            }

            const data = await handler({
                ctx: { ...ctx, user: ctx.user, family: ctx.family },
                input: parsed.data,
            });
            return NextResponse.json(data, { headers: NO_STORE });
        } catch (error) {
            if (error instanceof DomainError) {
                return fail(400, { code: 'domain', message: error.message });
            }

            console.error('[route]', error);
            return fail(500, { code: 'unexpected', message: 'Не удалось выполнить операцию. Попробуйте снова' });
        }
    };
}
