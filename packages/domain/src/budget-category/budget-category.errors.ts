import { DomainError } from '../shared';

export class BudgetCategoryError extends DomainError {}

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
