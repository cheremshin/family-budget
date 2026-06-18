import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { getRepositories } from '../container';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function getSession() {
    const cookie = (await cookies()).get('session');
    if (!cookie) return null;

    try {
        const { payload } = await jwtVerify(cookie.value, secret);
        const user = await getRepositories().userRepository.findById(
            payload.userId as string,
        );

        if (!user) {
            throw new Error(`User doesn't exists`);
        }

        return { user };
    } catch {
        return null;
    }
}

export async function setSession(userId: string) {
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(secret);

    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
    });
}

export async function invalidateSession() {
    (await cookies()).delete('session');
}
