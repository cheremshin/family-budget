import { jwtVerify, SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { secret } from './configuration/secret';
import { cookies } from 'next/headers';
import {
    COOKIE_KEY,
    SESSION_COOKIE_OPTIONS,
} from './configuration/cookie-options';
import { Session } from './types/session';
import { cache } from 'react';

export async function create(data: { userId: string }): Promise<void> {
    const token = await new SignJWT()
        .setSubject(data.userId)
        .setJti(uuidv4())
        .setIssuedAt()
        .setIssuer('family-budget')
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_KEY, token, SESSION_COOKIE_OPTIONS);
}

export async function invalidate(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_KEY);
}

export const get = cache(async (): Promise<Session | null> => {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_KEY);
    if (!cookie) return null;

    try {
        const { payload } = await jwtVerify(cookie.value, secret, {
            issuer: 'family-budget',
        });

        return {
            sessionId: payload.jti!,
            userId: payload.sub!,
        };
    } catch {
        return null;
    }
});
