export class BudgetCategoryError extends Error {}

export class BudgetCategoryNotFound extends BudgetCategoryError {
    constructor() {
        super(`Категория не найдена`);
    }
}

export class ArchiveSystemBudgetCategoryError extends BudgetCategoryError {
    constructor() {
        super(`Нельзя удалить системную категорию`);
    }
}
