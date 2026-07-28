import {
    ArchiveSystemBudgetCategoryError,
    BudgetCategory,
    CreateCategoryInput,
    UpdateCategoryInput,
} from '@family-budget/domain/budget-category';
import { insertBudgetCategory } from './actions/insert-budget-category';
import { updateBudgetCategory } from './actions/update-budget-category';
import { getBudgetCategory } from './queries/get-budget-category';
import { mapToBudgetCategory } from './budget-category.mappers';
import { requireFamilyMember } from '../family';

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
