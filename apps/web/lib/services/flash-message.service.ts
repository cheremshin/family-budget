import { cookies } from 'next/headers';
import { FlashMessage } from '../entities/flash-message';

export const FLASH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 30,
    path: '/',
} as const;

export class FlashMessageService {
    private readonly COOCKIE_KEY = 'flash';

    async set(message: FlashMessage): Promise<void> {
        const cookieStore = await cookies();
        cookieStore.set(
            this.COOCKIE_KEY,
            JSON.stringify(message),
            FLASH_COOKIE_OPTIONS,
        );
    }

    async get(): Promise<FlashMessage | null> {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(this.COOCKIE_KEY);
        if (!cookie) return null;

        try {
            return JSON.parse(cookie.value);
        } catch {
            return null;
        }
    }

    async delete(): Promise<void> {
        (await cookies()).delete(this.COOCKIE_KEY);
    }
}
