import { db } from '@family-budget/database';

import { MAX_CREATE_ATTEMPTS } from '../configuration/max-create-attempts';
import { generateRandomCode } from './generate-random-code';

export async function generateInvitationCode(): Promise<string | undefined> {
    for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
        const code = generateRandomCode(8);

        const familyWithSameCode = await db.query.families.findFirst({
            where: { invitationCode: { eq: code } },
        });
        if (familyWithSameCode) continue;

        return code;
    }

    return undefined;
}
