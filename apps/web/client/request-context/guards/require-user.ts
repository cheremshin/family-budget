import { redirect } from 'next/navigation';

import { routes } from '@/routes';

import { getRequestContext } from '../get-request-context';

export async function requireUser() {
    const ctx = await getRequestContext();

    if (!ctx.user) {
        redirect(routes.signIn);
    }

    return ctx.user;
}
