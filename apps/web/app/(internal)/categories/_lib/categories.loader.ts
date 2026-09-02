import { cache } from 'react';

import { budgetCategoryService } from '@/lib/budget-category';
import { requireFamily } from '@/lib/request-context';

export const loadCategories = cache(async () => {
    const family = await requireFamily();
    return await budgetCategoryService.getFamilyCategories(family.id);
});
