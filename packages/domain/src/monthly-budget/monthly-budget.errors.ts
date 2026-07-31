export class MonthlyBudgetError extends Error {}

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

export class PlannedIncomeNotSet extends MonthlyBudgetError {
    constructor() {
        super(`За указанный период нет запланированных доходов от пользователя`);
    }
}
