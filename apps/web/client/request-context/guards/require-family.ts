import { redirect } from 'next/navigation';

import { getRequestContext } from '../get-request-context';
import { routes } from '@/routes';

export async function requireFamily() {
    const ctx = await getRequestContext();

    if (!ctx.family) {
        redirect(routes.createFamily);
    }

    return ctx.family;
}
