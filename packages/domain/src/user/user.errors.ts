import { DomainError } from '../shared';

export class UserError extends DomainError {}

export class UserNotFound extends UserError {
    constructor() {
        super(`Пользователь не найден`);
    }
}
