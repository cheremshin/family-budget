import { sessionService } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function requireSession() {
    const session = await sessionService.get();
    if (!session) {
        redirect('/auth/sign-in');
    }
    return session;
}
