import { DomainError } from '../shared';
import type { CloseBlocker, PlanBlocker, ReceiptBlocker } from './monthly-budget.rules';

export class MonthlyBudgetError extends DomainError {}

export class MonthlyBudgetNotFound extends MonthlyBudgetError {
    constructor() {
        super(`Указанный месяц не найден`);
    }
}

const CLOSE_BLOCKER_MESSAGES: Record<CloseBlocker, string> = {
    'not-owner': 'Зафиксировать месяц может только владелец семьи',
    closed: 'Месяц уже зафиксирован',
    'plan-incomplete': 'Не все участники указали плановый доход',
    'no-categories': 'В месяце нет ни одной категории',
    'over-allocated': 'Категории требуют больше, чем плановый доход семьи',
};

const PLAN_BLOCKER_MESSAGES: Record<PlanBlocker, string> = {
    closed: 'Месяц закрыт - план нельзя изменить',
    foreign: 'Изменить план может только его владелец',
};

const RECEIPT_BLOCKER_MESSAGES: Record<ReceiptBlocker, string> = {
    foreign: 'Добавить поступление может только его получатель',
    'no-plan': 'Сначала укажите плановый доход',
};

export const closeBlockerMessage = (blocker: CloseBlocker): string =>
    CLOSE_BLOCKER_MESSAGES[blocker];
export const planBlockerMessage = (blocker: PlanBlocker): string => PLAN_BLOCKER_MESSAGES[blocker];
export const receiptBlockerMessage = (blocker: ReceiptBlocker): string =>
    RECEIPT_BLOCKER_MESSAGES[blocker];

export class MonthlyBudgetCloseBlocked extends MonthlyBudgetError {
    constructor(readonly blocker: CloseBlocker) {
        super(closeBlockerMessage(blocker));
    }
}

export class MonthlyBudgetPlanBlocked extends MonthlyBudgetError {
    constructor(readonly blocker: PlanBlocker) {
        super(planBlockerMessage(blocker));
    }
}

export class MonthlyBudgetReceiptBlocked extends MonthlyBudgetError {
    constructor(readonly blocker: ReceiptBlocker) {
        super(receiptBlockerMessage(blocker));
    }
}
