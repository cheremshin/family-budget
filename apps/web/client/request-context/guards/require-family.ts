import { redirect } from 'next/navigation';

import { routes } from '@/routes';

import { getRequestContext } from '../get-request-context';

export async function requireFamily() {
    const ctx = await getRequestContext();

    if (!ctx.family) {
        redirect(routes.createFamily);
    }

    return ctx.family;
}
