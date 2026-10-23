import { Family, familySchema } from '@family-budget/domain/family';
import { assertContract } from '@family-budget/domain/shared';

import { FamilyWithRelations } from './types';

export function mapToFamily(family: FamilyWithRelations): Family {
    return assertContract(
        familySchema,
        {
            id: family.id,
            name: family.name,
            invitationCode: family.invitationCode,
            maxMembers: family.maxMembers,
            ownerId: family.ownerId,
            settings: {
                budgetDivisionType: family.settings.budgetDivisionType,
                personalRemainderPolicy: family.settings.personalRemainderPolicy,
            },
            members: family.members.map((member) => ({
                id: member.id,
                username: member.username,
            })),
        },
        'mapToFamily',
    );
}
