import { DomainError } from '../shared';

export class MonthlyBudgetError extends DomainError {}

export class MonthlyBudgetClosedError extends MonthlyBudgetError {
    constructor() {
        super(`Невозможно редактировать закрытый месяц`);
    }
}

export class MonthlyBudgetNotFound extends MonthlyBudgetError {
    constructor() {
        super(`Указанный месяц не найден`);
    }
}

export class MonthlyBudgetPlanIncomplete extends MonthlyBudgetError {
    constructor() {
        super(`Нельзя закрыть месяц: не все участники семьи указали плановый доход`);
    }
}

export class MonthlyBudgetOverAllocated extends MonthlyBudgetError {
    constructor() {
        super(`Нельзя закрыть месяц: категории требуют больше, чем плановый доход семьи`);
    }
}

export class MonthlyBudgetHasNoItems extends MonthlyBudgetError {
    constructor() {
        super(`В месяце нет категорий, невозможно закрыть`);
    }
}

export class PlannedIncomeNotSet extends MonthlyBudgetError {
    constructor() {
        super(`За указанный период нет запланированных доходов от пользователя`);
    }
}
