import { DomainError } from '../shared';

export class FamilyError extends DomainError {}

export class FamilyNotFound extends FamilyError {
    constructor() {
        super(`Семья не найдена`);
    }
}

export class FamilyAlreadyExistsError extends FamilyError {
    constructor() {
        super(`У вас уже есть семья!`);
    }
}

export class NoFamilyYetError extends FamilyError {
    constructor() {
        super(`У вас еще нет семьи`);
    }
}

export class GenerateFamilyInvitationCodeError extends FamilyError {
    constructor() {
        super(`Не удалось сгенерировать код-приглашение, попробуйте позже`);
    }
}

export class NoSuchFamilyCodeError extends FamilyError {
    constructor() {
        super(`Код-приглашение не действителен`);
    }
}

export class FamilyIsFullError extends FamilyError {
    constructor() {
        super(`Семья уже полная`);
    }
}
