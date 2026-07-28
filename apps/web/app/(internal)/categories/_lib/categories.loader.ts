import { getFamilyBudgetCategories, mapToBudgetCategory } from '@/lib/budget-category';
import { requireFamily } from '@/lib/request-context';
import { cache } from 'react';

export const loadCategories = cache(async () => {
    const family = await requireFamily();
    const categories = await getFamilyBudgetCategories(family.id, { archived: false });
    return categories.map((category) => mapToBudgetCategory(category));
});
