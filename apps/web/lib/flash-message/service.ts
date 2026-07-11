import { cookies } from 'next/headers';
import { FlashMessage } from './types/flash-message';
import {
    COOKIE_KEY,
    FLASH_COOKIE_OPTIONS,
} from './configuration/cookie-options';

export async function set(message: FlashMessage): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_KEY, JSON.stringify(message), FLASH_COOKIE_OPTIONS);
}

export async function get(): Promise<FlashMessage | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_KEY);
    if (!cookie) return null;

    try {
        return JSON.parse(cookie.value);
    } catch {
        return null;
    }
}

export async function remove(): Promise<void> {
    (await cookies()).delete(COOKIE_KEY);
}
