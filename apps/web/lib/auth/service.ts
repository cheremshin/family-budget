import bcrypt from 'bcryptjs';

import { AuthenticatedUser } from '@family-budget/domain/user';

import { createUser } from '@/lib/user/actions/create-user';
import { getUserByUsername } from '@/lib/user/queries/get-user-by-username';

import { SignInError, SignUpError } from './errors';
import { Credentials } from './types/credentials';

export async function signIn(credentials: Credentials): Promise<AuthenticatedUser> {
    const username = credentials.username.toLowerCase();
    const existing = await getUserByUsername(username);

    const validCredentials =
        existing && (await bcrypt.compare(credentials.password, existing.passwordHash));

    if (!validCredentials) throw new SignInError();

    return {
        id: existing.id,
        username: existing.username,
        familyId: existing.familyId,
    };
}

export async function signUp(credentials: Credentials): Promise<AuthenticatedUser> {
    const username = credentials.username.toLowerCase();
    const existing = await getUserByUsername(username);

    if (existing) throw new SignUpError();

    const passwordHash = await bcrypt.hash(credentials.password, 12);
    const newUser = await createUser({ username, passwordHash });

    return {
        id: newUser.id,
        username: newUser.username,
        familyId: newUser.familyId,
    };
}
