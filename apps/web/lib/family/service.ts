import { eq, schema } from '@family-budget/database';
import { db } from '@family-budget/database/connection';
import {
    type CreateFamilyInput,
    type Family,
    FamilyAlreadyExistsError,
    FamilyIsFullError,
    type FamilySettings,
    GenerateFamilyInvitationCodeError,
    NoSuchFamilyCodeError,
    type UpdateFamilyInput,
} from '@family-budget/domain/family';
import { AuthenticatedUser } from '@family-budget/domain/user';

import { SYSTEM_CATEGORIES } from '@/lib/budget-category';
import { insertBudgetCategories } from '@/lib/budget-category/actions/insert-budget-category';
import { getUser } from '@/lib/user/';
import { setFamily } from '@/lib/user/actions/set-family';

import { insertFamily } from './actions/insert-family';
import { insertFamilySettings } from './actions/insert-family-settings';
import { lockFamilyByInvitationCode } from './actions/lock-family-by-invitation-code';
import { updateFamily } from './actions/update-family';
import { updateFamilySettings } from './actions/update-family-settings';
import { requireFamilyMember } from './guards/require-family-member';
import { generateInvitationCode } from './utils/generate-invitation-code';

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

        await insertBudgetCategories(
            SYSTEM_CATEGORIES.map((data) => ({
                ...data,
                familyId: createdFamily.id,
            })),
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
