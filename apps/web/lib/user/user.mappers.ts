import { UserPersist } from '@family-budget/database';
import { assertContract } from '@family-budget/domain/shared';
import { AuthenticatedUser, authenticatedUserSchema } from '@family-budget/domain/user';

export function mapToAuthenticatedUser(user: UserPersist): AuthenticatedUser {
    return assertContract(
        authenticatedUserSchema,
        {
            id: user.id,
            username: user.username,
            familyId: user.familyId,
        },
        'mapToAuthenticatedUser',
    );
}
