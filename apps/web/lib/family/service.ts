import { db } from '@family-budget/database/connection';
import { eq, schema } from '@family-budget/database';
import { generateInvitationCode } from './utils/generate-invitation-code';
import { insertFamily } from './actions/insert-family';
import { insertFamilySettings } from './actions/insert-family-settings';
import { setFamily } from '@/lib/user/actions/set-family';
import { getUser } from '@/lib/user/';
import { lockFamilyByInvitationCode } from './actions/lock-family-by-invitation-code';
import { updateFamily } from './actions/update-family';
import { updateFamilySettings } from './actions/update-family-settings';
import {
    CreateFamilyInput,
    Family,
    FamilyAlreadyExistsError,
    FamilyIsFullError,
    FamilySettings,
    GenerateFamilyInvitationCodeError,
    NoSuchFamilyCodeError,
    UpdateFamilyInput,
} from '@family-budget/domain/family';
import { AuthenticatedUser } from '@family-budget/domain/user';
import { requireFamilyMember } from './guards/require-family-member';

export async function create(userId: string, input: CreateFamilyInput): Promise<Family> {
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
                name: input.name,
                invitationCode: code,
                ownerId: user.id,
            },
            tx,
        );

        const createdFamilySettings = await insertFamilySettings(
            {
                familyId: createdFamily.id,
                budgetDivisionType: input.budgetDivisionType,
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
            ownerId: createdFamily.ownerId,
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

export async function updateInvitationCode(userId: string): Promise<string> {
    const familyId = await requireFamilyMember(userId);
    const code = await generateInvitationCode();
    if (!code) throw new GenerateFamilyInvitationCodeError();

    await updateFamily(familyId, {
        invitationCode: code,
    });

    return code;
}

export async function saveSettings(
    userId: string,
    input: UpdateFamilyInput,
): Promise<{
    name: string;
    maxMembers: number;
    settings: FamilySettings;
}> {
    const familyId = await requireFamilyMember(userId);
    return await db.transaction(async (tx) => {
        const family = await updateFamily(
            familyId,
            { name: input.name, maxMembers: input.maxMembers },
            tx,
        );
        const familySettings = await updateFamilySettings(
            familyId,
            { budgetDivisionType: input.budgetDivisionType },
            tx,
        );

        return {
            name: family.name,
            maxMembers: family.maxMembers,
            settings: familySettings,
        };
    });
}
