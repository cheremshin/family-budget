export class AuthError extends Error {}

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
