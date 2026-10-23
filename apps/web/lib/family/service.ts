import { Executor, eq, schema } from '@family-budget/database';
import { db } from '@family-budget/database/connection';
import {
    type CreateFamilyInput,
    type Family,
    FamilyAlreadyExistsError,
    FamilyIsFullError,
    type FamilyMember,
    FamilyNotFound,
    GenerateFamilyInvitationCodeError,
    NoSuchFamilyCodeError,
    type UpdateFamilyInput,
} from '@family-budget/domain/family';
import { AuthenticatedUser } from '@family-budget/domain/user';

import { budgetCategoryService } from '@/lib/budget-category';
import { userService } from '@/lib/user';

import { mapToFamily } from './family.mappers';
import { requireFamilyMember } from './guards/require-family-member';
import { insertFamily } from './mutations/insert-family';
import { insertFamilySettings } from './mutations/insert-family-settings';
import { lockFamilyByInvitationCode } from './mutations/lock-family-by-invitation-code';
import { updateFamily } from './mutations/update-family';
import { updateFamilySettings } from './mutations/update-family-settings';
import { getFamily as getFamilyRow } from './queries/get-family';
import { getFamilyMembers } from './queries/get-family-members';
import { generateInvitationCode } from './utils/generate-invitation-code';
import { requireFamilyOwner } from '@/lib/family/guards/require-family-owner';

export async function getFamily(id: string, tx: Executor = db): Promise<Family | undefined> {
    const row = await getFamilyRow(id, tx);
    return row && mapToFamily(row);
}

export async function getMembers(familyId: string, tx: Executor = db): Promise<FamilyMember[]> {
    return await getFamilyMembers(familyId, tx);
}

export async function requireFamily(id: string, tx: Executor = db): Promise<Family> {
    const family = await getFamily(id, tx);

    if (!family) {
        throw new FamilyNotFound();
    }

    return family;
}

export async function create(userId: string, input: CreateFamilyInput): Promise<Family> {
    const user = await userService.getUser(userId);

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

        await budgetCategoryService.seedSystemCategories(createdFamily.id, tx);

        const updatedUser = await userService.setFamily(userId, createdFamily.id, tx);

        return mapToFamily({
            ...createdFamily,
            settings: createdFamilySettings,
            members: [
                {
                    id: userId,
                    username: updatedUser.username,
                },
            ],
        });
    });
}

export async function acceptInvite(
    userId: string,
    invitationCode: string,
): Promise<AuthenticatedUser> {
    const user = await userService.getUser(userId);

    if (!user) throw new Error('Пользователь не найден');
    if (user.familyId) throw new FamilyAlreadyExistsError();

    return await db.transaction(async (tx) => {
        const family = await lockFamilyByInvitationCode(invitationCode, tx);
        if (!family) throw new NoSuchFamilyCodeError();

        const membersCount = await tx.$count(schema.users, eq(schema.users.familyId, family.id));
        if (membersCount >= family.maxMembers) throw new FamilyIsFullError();

        return await userService.setFamily(userId, family.id, tx);
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

export async function saveSettings(userId: string, input: UpdateFamilyInput): Promise<Family> {
    const familyId = await requireFamilyOwner(userId);

    return await db.transaction(async (tx) => {
        await updateFamily(familyId, { name: input.name, maxMembers: input.maxMembers }, tx);
        await updateFamilySettings(familyId, { budgetDivisionType: input.budgetDivisionType }, tx);

        return await requireFamily(familyId, tx);
    });
}
