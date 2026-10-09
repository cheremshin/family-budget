import { redirect } from 'next/navigation';

import { getRequestContext } from '../get-request-context';
import { routes } from '@/routes';

export async function requireUser() {
    const ctx = await getRequestContext();

    if (!ctx.user) {
        redirect(routes.signIn);
    }

    return ctx.user;
}
