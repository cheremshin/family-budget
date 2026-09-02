import bcrypt from 'bcryptjs';

import { AuthenticatedUser } from '@family-budget/domain/user';

import { mapToAuthenticatedUser, userService } from '@/lib/user';

import { SignInError, SignUpError } from './errors';
import { Credentials } from './types';

export async function signIn(credentials: Credentials): Promise<AuthenticatedUser> {
    const username = credentials.username.toLowerCase();
    const existing = await userService.findForAuthentication(username);

    const validCredentials =
        existing && (await bcrypt.compare(credentials.password, existing.passwordHash));

    if (!validCredentials) throw new SignInError();

    return mapToAuthenticatedUser(existing);
}

export async function signUp(credentials: Credentials): Promise<AuthenticatedUser> {
    const username = credentials.username.toLowerCase();
    const existing = await userService.findForAuthentication(username);

    if (existing) throw new SignUpError();

    const passwordHash = await bcrypt.hash(credentials.password, 12);

    return await userService.create({ username, passwordHash });
}
