import type { Actor } from '@family-budget/domain/family';

export type Viewer = {
    userId: string;
    familyId: string;
    isOwner: boolean;
};

export const toActor = (viewer: Viewer): Actor => ({
    memberId: viewer.userId,
    isOwner: viewer.isOwner,
});
