import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    families,
    users,
    monthlyBudget,
    plannedIncomes,
    incomes,
} from './schema';

export type FamilyPersist = InferSelectModel<typeof families>;
export type NewFamilyPersist = InferInsertModel<typeof families>;

export type UserPersist = InferSelectModel<typeof users>;
export type NewUserPersist = InferInsertModel<typeof users>;

export type MonthlyBudgetPersist = InferSelectModel<typeof monthlyBudget>;
export type NewMonthlyBudgetPersist = InferInsertModel<typeof monthlyBudget>;

export type PlannedIncomePersist = InferSelectModel<typeof plannedIncomes>;
export type NewPlannedIncomePersist = InferInsertModel<typeof plannedIncomes>;

export type IncomePersist = InferSelectModel<typeof incomes>;
export type NewIncomePersist = InferInsertModel<typeof incomes>;
