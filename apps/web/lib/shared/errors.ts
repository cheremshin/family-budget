export class InsufficientPermissionError extends Error {
    constructor() {
        super(`Недостаточно прав на выполнение действия`);
    }
}
