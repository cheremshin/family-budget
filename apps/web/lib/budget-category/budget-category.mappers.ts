import { BudgetCategoryPersist } from '@family-budget/database';
import { BudgetCategory, budgetCategorySchema } from '@family-budget/domain/budget-category';
import { assertContract } from '@family-budget/domain/shared';

export function mapToBudgetCategory(category: BudgetCategoryPersist): BudgetCategory {
    return assertContract(
        budgetCategorySchema,
        {
            id: category.id,
            name: category.name,
            type: category.type,
            calculationMode: category.calculationMode,
            targetAmount: category.targetAmount,
            sortOrder: category.sortOrder,
            isSystem: category.isSystem,
        },
        'mapToBudgetCategory',
    );
}
