import { getUser } from '@/lib/user';
import { FamilyNotFound, NoFamilyYetError } from '@family-budget/domain/family';
import { UserNotFound } from '@family-budget/domain/user';
import { getFamilyMembers } from '../queries/get-family-members';
import { InsufficientPermissionError } from '@/lib/shared/errors';

export async function requireFamilyMember(
    userId: string,
    targetFamilyId?: string,
): Promise<string> {
    const user = await getUser(userId);
    if (!user) throw new UserNotFound();
    if (!user.familyId) throw new NoFamilyYetError();

    const members = await getFamilyMembers(targetFamilyId ?? user.familyId);
    if (!members || members.length === 0) throw new FamilyNotFound();

    const isMember = members.some((member) => member.id === userId);
    if (!isMember) throw new InsufficientPermissionError();

    return user.familyId;
}
