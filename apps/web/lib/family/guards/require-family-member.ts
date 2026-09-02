import { NoFamilyYetError } from '@family-budget/domain/family';
import { UserNotFound } from '@family-budget/domain/user';

import { InsufficientPermissionError } from '@/lib/shared';
import { userService } from '@/lib/user';

export async function requireFamilyMember(
    userId: string,
    targetFamilyId?: string,
): Promise<string> {
    const user = await userService.getUser(userId);
    if (!user) throw new UserNotFound();
    if (!user.familyId) throw new NoFamilyYetError();

    if (targetFamilyId && targetFamilyId !== user.familyId) {
        throw new InsufficientPermissionError();
    }

    return user.familyId;
}
