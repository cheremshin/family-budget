import {
    IncomePersist,
    MonthlyBudgetItemPersist,
    type MonthlyBudgetPersist,
    PlannedIncomePersist,
} from '@family-budget/database';

export type PlannedIncomeWithIncomes = PlannedIncomePersist & {
    incomes: IncomePersist[];
};

export type MonthlyBudgetWithRelations = MonthlyBudgetPersist & {
    items: MonthlyBudgetItemPersist[];
    plannedIncomes: Array<PlannedIncomeWithIncomes>;
};
