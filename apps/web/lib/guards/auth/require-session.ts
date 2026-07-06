'use server';

import { redirect } from 'next/navigation';
import { getSession } from './cached-session';

export async function requireSession() {
    const session = await getSession();
    if (!session) {
        redirect('/auth/sign-in');
    }
    return session;
}
