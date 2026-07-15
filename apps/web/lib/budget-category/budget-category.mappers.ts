import { BudgetCategoryPersist } from '@family-budget/database';
import { BudgetCategory } from '@family-budget/domain/budget-category';

export function mapToBudgetCategory(category: BudgetCategoryPersist): BudgetCategory {
    return {
        id: category.id,
        name: category.name,
        type: category.type,
        calculationMode: category.calculationMode,
        targetAmount: category.targetAmount,
        sortOrder: category.sortOrder,
        isSystem: category.isSystem,
    };
}
