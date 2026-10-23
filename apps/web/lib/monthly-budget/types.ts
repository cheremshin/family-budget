import type {
    IncomePersist,
    MonthlyBudgetContributionPersist,
    MonthlyBudgetItemPersist,
    MonthlyBudgetPersist,
    MonthlyBudgetRemainderPersist,
    PlannedIncomePersist,
    UserPersist,
} from '@family-budget/database';
import { Period } from '@family-budget/domain/shared';

export type CreateMonthlyBudgetParams = {
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
    contributions: MonthlyBudgetContributionPersist[];
    remainders: MonthlyBudgetRemainderPersist[];
};
