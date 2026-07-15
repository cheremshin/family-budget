export class UserError extends Error {}

export class UserNotFound extends UserError {
    constructor() {
        super(`Пользователь не найден`);
    }
}
