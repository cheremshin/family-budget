import { FamilyNotFound, NoFamilyYetError } from '@family-budget/domain/family';
import { UserNotFound } from '@family-budget/domain/user';

import { InsufficientPermissionError } from '@/lib/shared/errors';
import { getUser } from '@/lib/user';

import { getFamilyOwnership } from '../queries/get-family-ownership';

export async function requireFamilyOwner(userId: string, targetFamilyId?: string): Promise<string> {
    const user = await getUser(userId);
    if (!user) throw new UserNotFound();
    if (!user.familyId) throw new NoFamilyYetError();

    const family = await getFamilyOwnership(targetFamilyId ?? user.familyId);
    if (!family) throw new FamilyNotFound();
    if (family.ownerId !== user.id) throw new InsufficientPermissionError();

    return family.id;
}
