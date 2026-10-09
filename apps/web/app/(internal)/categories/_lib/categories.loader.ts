import { cache } from 'react';

import { requireFamily } from '@/client/request-context';
import { budgetCategoryService } from '@/lib/budget-category';

export const loadCategories = cache(async () => {
    const family = await requireFamily();
    return await budgetCategoryService.getFamilyCategories(family.id);
});
