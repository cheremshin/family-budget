import { Executor, db } from '@family-budget/database';
import {
    ArchiveSystemBudgetCategoryError,
    BudgetCategory,
    CreateCategoryInput,
    UpdateCategoryInput,
} from '@family-budget/domain/budget-category';

import { requireFamilyMember } from '../family';
import { mapToBudgetCategory } from './budget-category.mappers';
import { SYSTEM_CATEGORIES } from './configuration/system-categories';
import { insertBudgetCategories, insertBudgetCategory } from './mutations/insert-budget-category';
import { updateBudgetCategory } from './mutations/update-budget-category';
import { getBudgetCategory } from './queries/get-budget-category';
import { getFamilyBudgetCategories } from './queries/get-family-budget-categories';

export async function getFamilyCategories(
    familyId: string,
    tx: Executor = db,
): Promise<BudgetCategory[]> {
    const rows = await getFamilyBudgetCategories(familyId, { archived: false }, tx);
    return rows.map(mapToBudgetCategory);
}

export async function seedSystemCategories(
    familyId: string,
    tx: Executor = db,
): Promise<BudgetCategory[]> {
    const rows = await insertBudgetCategories(
        SYSTEM_CATEGORIES.map((category) => ({ ...category, familyId })),
        tx,
    );

    return rows.map(mapToBudgetCategory);
}

export async function create(userId: string, input: CreateCategoryInput): Promise<BudgetCategory> {
    const familyId = await requireFamilyMember(userId);
    const category = await insertBudgetCategory({ ...input, familyId });
    return mapToBudgetCategory(category);
}

export async function update(
    userId: string,
    categoryId: string,
    input: UpdateCategoryInput,
): Promise<BudgetCategory> {
    const familyId = await requireFamilyMember(userId);
    const category = await getBudgetCategory(categoryId);
    if (!category || category.familyId !== familyId) {
        throw new Error('Категория не найдена');
    }

    const updatedCategory = await updateBudgetCategory(categoryId, input);
    return mapToBudgetCategory(updatedCategory);
}

export async function archive(userId: string, categoryId: string): Promise<void> {
    const familyId = await requireFamilyMember(userId);
    const category = await getBudgetCategory(categoryId);
    if (!category || category.familyId !== familyId) {
        throw new Error('Категория не найдена');
    }
    if (category.isSystem) {
        throw new ArchiveSystemBudgetCategoryError();
    }

    await updateBudgetCategory(categoryId, { archived: true, archivedAt: new Date() });
}
