import { redirect } from 'next/navigation';

import { getRequestContext } from '../get-request-context';

export async function requireUser() {
    const ctx = await getRequestContext();

    if (!ctx.user) {
        redirect('/auth/sign-in');
    }

    return ctx.user;
}
