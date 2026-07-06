import { jwtVerify, SignJWT } from 'jose';
import { Session } from '@/lib/entities/session';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
} as const;

export class SessionService {
    private readonly secret: Uint8Array<ArrayBuffer>;
    private readonly COOKIE_KEY = 'session';

    constructor() {
        this.secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    }

    async setSession(data: { userId: string }): Promise<void> {
        const token = await new SignJWT()
            .setSubject(data.userId)
            .setJti(uuidv4())
            .setIssuedAt()
            .setIssuer('family-budget')
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(this.secret);

        const cookieStore = await cookies();
        cookieStore.set(this.COOKIE_KEY, token, SESSION_COOKIE_OPTIONS);
    }

    async getSession(): Promise<Session | null> {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(this.COOKIE_KEY);
        if (!cookie) return null;

        try {
            const { payload } = await jwtVerify(cookie.value, this.secret, {
                issuer: 'family-budget',
            });
            return {
                sessionId: payload.jti!,
                userId: payload.sub!,
            };
        } catch {
            return null;
        }
    }

    async invalidateSession(): Promise<void> {
        const cookieStore = await cookies();
        cookieStore.delete(this.COOKIE_KEY);
    }
}
