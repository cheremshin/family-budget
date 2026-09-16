import type { Family } from '@family-budget/domain/family';
import type { AuthenticatedUser } from '@family-budget/domain/user';

import type { Viewer } from '@/client/core';

export function toViewer(user: AuthenticatedUser, family: Family): Viewer {
    return {
        userId: user.id,
        familyId: family.id,
        isOwner: family.ownerId === user.id,
    };
}
