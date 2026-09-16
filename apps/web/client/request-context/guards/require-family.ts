import { redirect } from 'next/navigation';

import { getRequestContext } from '../get-request-context';

export async function requireFamily() {
    const ctx = await getRequestContext();

    if (!ctx.family) {
        redirect('/create-family');
    }

    return ctx.family;
}
