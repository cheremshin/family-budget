export const FLASH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 30,
    path: '/',
} as const;

export const COOKIE_KEY = 'flash';
