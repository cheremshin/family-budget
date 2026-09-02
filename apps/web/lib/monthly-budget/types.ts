import {
    IncomePersist,
    MonthlyBudgetItemPersist,
    type MonthlyBudgetPersist,
    PlannedIncomePersist,
    UserPersist,
} from '@family-budget/database';
import { Period } from '@family-budget/domain/shared';

export type EnsureMonthlyBudgetParams = {
    familyId: string;
    period: Period;
};

export type PlannedIncomeWithRelations = PlannedIncomePersist & {
    user: UserPersist;
    incomes: IncomePersist[];
};

export type MonthlyBudgetWithRelations = MonthlyBudgetPersist & {
    items: MonthlyBudgetItemPersist[];
    plannedIncomes: PlannedIncomeWithRelations[];
};
