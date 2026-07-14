import { db } from '@family-budget/database/connection';
import { BudgetDivisionType, eq, schema } from '@family-budget/database';
import { Family } from './types/family';
import {
    FamilyAlreadyExistsError,
    FamilyIsFullError,
    GenerateFamilyInvitationCodeError,
    NoSuchFamilyCodeError,
} from './errors';
import { generateInvitationCode } from './utils/generate-invitation-code';
import { insertFamily } from './actions/insert-family';
import { insertFamilySettings } from './actions/insert-family-settings';
import { setFamily } from '@/lib/user/actions/set-family';
import { AuthenticatedUser } from '@/lib/user/types/authenticated-user';
import { getUser } from '@/lib/user/';
import { lockFamilyByInvitationCode } from './actions/lock-family-by-invitation-code';
import { updateFamily } from './actions/update-family';
import { FamilySettings } from './types/family-settings';
import { updateFamilySettings } from './actions/update-family-settings';

export async function create(
    userId: string,
    familyName: string,
    budgetDivisionType: BudgetDivisionType,
): Promise<Family> {
    const user = await getUser(userId);

    if (!user) throw new Error('Пользователь не найден');
    if (user.familyId) throw new FamilyAlreadyExistsError();

    const code = await generateInvitationCode();
    if (!code) {
        throw new GenerateFamilyInvitationCodeError();
    }

    return await db.transaction(async (tx) => {
        const createdFamily = await insertFamily(
            {
                name: familyName,
                invitationCode: code,
                ownerId: user.id,
            },
            tx,
        );

        const createdFamilySettings = await insertFamilySettings(
            {
                familyId: createdFamily.id,
                budgetDivisionType,
            },
            tx,
        );

        const updatedUser = await setFamily(
            {
                userId,
                familyId: createdFamily.id,
            },
            tx,
        );

        return {
            id: createdFamily.id,
            name: createdFamily.name,
            invitationCode: createdFamily.invitationCode,
            maxMembers: createdFamily.maxMembers,
            settings: {
                budgetDivisionType: createdFamilySettings.budgetDivisionType,
            },
            members: [
                {
                    id: userId,
                    username: updatedUser.username,
                },
            ],
        };
    });
}

export async function acceptInvite(
    userId: string,
    invitationCode: string,
): Promise<AuthenticatedUser> {
    const user = await getUser(userId);

    if (!user) throw new Error('Пользователь не найден');
    if (user.familyId) throw new FamilyAlreadyExistsError();

    return await db.transaction(async (tx) => {
        const family = await lockFamilyByInvitationCode(invitationCode, tx);
        if (!family) throw new NoSuchFamilyCodeError();

        const membersCount = await tx.$count(schema.users, eq(schema.users.familyId, family.id));
        if (membersCount >= family.maxMembers) throw new FamilyIsFullError();

        const updatedUser = await setFamily(
            {
                userId,
                familyId: family.id,
            },
            tx,
        );

        return {
            id: updatedUser.id,
            username: updatedUser.username,
            familyId: updatedUser.familyId,
        };
    });
}

export async function updateInvitationCode(familyId: string): Promise<string> {
    const code = await generateInvitationCode();
    if (!code) throw new GenerateFamilyInvitationCodeError();

    await updateFamily(familyId, {
        invitationCode: code,
    });

    return code;
}

export async function saveSettings(
    familyId: string,
    name: string,
    settings: FamilySettings,
): Promise<{
    name: string;
    settings: FamilySettings;
}> {
    return await db.transaction(async (tx) => {
        const family = await updateFamily(familyId, { name }, tx);
        const familySettings = await updateFamilySettings(familyId, settings, tx);

        return {
            name: family.name,
            settings: familySettings,
        };
    });
}
