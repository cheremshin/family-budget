import { Route } from 'next';

const pages = {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    createFamily: '/create-family',
    home: '/incomes',
} as const satisfies Record<string, Route>;

export const routes = {
    ...pages,
    acceptInvite: (code?: string): Route =>
        (code ? `/accept-invite?${new URLSearchParams({ code })}` : '/accept-invite') as Route,
    inviteLink: (code: string): Route => `/accept-invite/${encodeURIComponent(code)}` as Route,
};
