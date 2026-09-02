import { DomainError } from '@family-budget/domain/shared';

export class AuthError extends DomainError {}

export class SignInError extends AuthError {
    constructor() {
        super(`Неверный логин или пароль`);
    }
}

export class SignUpError extends AuthError {
    constructor() {
        super(`Пользователь с таким именем уже существует`);
    }
}
