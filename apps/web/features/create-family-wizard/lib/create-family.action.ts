'use server';

import { Family, familyService } from '@/lib/family';
import { CreateFamilyForm } from '../types';
import { requireAuth } from '@/guards/require-auth';

export async function createFamilyAction(
    data: CreateFamilyForm,
): Promise<Family> {
    const { user } = await requireAuth();
    const family = await familyService.create(
        user.id,
        data.name,
        data.budgetDivisionType,
    );
    return family;
}
