import { Executor, NewUser, UserPersist, db } from '@family-budget/database';
import { AuthenticatedUser } from '@family-budget/domain/user';

import { createUser } from './mutations/create-user';
import { setFamily as setFamilyRow } from './mutations/set-family';
import { getUser as getUserRow } from './queries/get-user';
import { getUserByUsername } from './queries/get-user-by-username';
import { mapToAuthenticatedUser } from './user.mappers';

export async function getUser(
    id: string,
    tx: Executor = db,
): Promise<AuthenticatedUser | undefined> {
    const row = await getUserRow(id, tx);
    return row && mapToAuthenticatedUser(row);
}

// Серверный метод, отдающий пользователя с хешем пароля
export async function findForAuthentication(username: string): Promise<UserPersist | undefined> {
    return await getUserByUsername(username);
}

export async function create(data: NewUser, tx: Executor = db): Promise<AuthenticatedUser> {
    return mapToAuthenticatedUser(await createUser(data, tx));
}

export async function setFamily(
    userId: string,
    familyId: string,
    tx: Executor = db,
): Promise<AuthenticatedUser> {
    return mapToAuthenticatedUser(await setFamilyRow({ userId, familyId }, tx));
}
