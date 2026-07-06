'use server';

import { container } from '@/lib/container';
import { CreateFamilyForm, CreateFamilyResult } from '../types';
import { requireAuth } from '@/lib/guards/auth/require-auth';

export async function createFamilyAction(
    data: CreateFamilyForm,
): Promise<CreateFamilyResult> {
    const { user } = await requireAuth();
    const result = await container.services.familyManagementService.create(
        user,
        data.name,
    );
    return result.family;
}
