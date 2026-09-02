import { DomainError } from '@family-budget/domain/shared';

export class InsufficientPermissionError extends DomainError {
    constructor() {
        super(`Недостаточно прав на выполнение действия`);
    }
}
