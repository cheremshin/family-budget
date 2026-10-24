import { type Actor, FamilyNotFound } from '@family-budget/domain/family';

import { getFamilyOwnership } from '../queries/get-family-ownership';
import { requireFamilyMember } from './require-family-member';

export async function requireActor(userId: string): Promise<{ familyId: string; actor: Actor }> {
    const familyId = await requireFamilyMember(userId);
    const family = await getFamilyOwnership(familyId);
    if (!family) throw new FamilyNotFound();

    return { familyId, actor: { memberId: userId, isOwner: family.ownerId === userId } };
}
