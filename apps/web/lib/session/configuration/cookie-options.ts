export const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
} as const;

export const COOKIE_KEY = 'session';
