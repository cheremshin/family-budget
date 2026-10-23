import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import {
    budgetCategories,
    families,
    familySettings,
    incomes,
    monthlyBudgetContributions,
    monthlyBudgetItems,
    monthlyBudgetRemainders,
    monthlyBudgets,
    plannedIncomes,
    users,
} from './schema';

type InferUpdateModel<T, K extends PropertyKey> = Partial<Omit<T, K>>;

export type UserPersist = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UpdateUser = InferUpdateModel<NewUser, 'id'>;

export type FamilyPersist = InferSelectModel<typeof families>;
export type NewFamily = InferInsertModel<typeof families>;
export type UpdateFamily = InferUpdateModel<NewFamily, 'id'>;

export type FamilySettingsPersist = InferSelectModel<typeof familySettings>;
export type NewFamilySettings = InferInsertModel<typeof familySettings>;
export type UpdateFamilySettings = InferUpdateModel<NewFamilySettings, 'familyId'>;

export type MonthlyBudgetPersist = InferSelectModel<typeof monthlyBudgets>;
export type NewMonthlyBudget = InferInsertModel<typeof monthlyBudgets>;
export type UpdateMonthlyBudget = InferUpdateModel<NewMonthlyBudget, 'id'>;

export type BudgetCategoryPersist = InferSelectModel<typeof budgetCategories>;
export type NewBudgetCategory = InferInsertModel<typeof budgetCategories>;
export type UpdateBudgetCategory = InferUpdateModel<NewBudgetCategory, 'id'>;

export type MonthlyBudgetItemPersist = InferSelectModel<typeof monthlyBudgetItems>;
export type NewMonthlyBudgetItem = InferInsertModel<typeof monthlyBudgetItems>;
export type UpdateMonthlyBudgetItem = InferUpdateModel<NewMonthlyBudgetItem, 'id'>;

export type PlannedIncomePersist = InferSelectModel<typeof plannedIncomes>;
export type NewPlannedIncome = InferInsertModel<typeof plannedIncomes>;
export type UpdatePlannedIncome = InferUpdateModel<NewPlannedIncome, 'id'>;

export type IncomePersist = InferSelectModel<typeof incomes>;
export type NewIncome = InferInsertModel<typeof incomes>;
export type UpdateIncome = InferUpdateModel<NewIncome, 'id'>;

export type MonthlyBudgetContributionPersist = InferSelectModel<typeof monthlyBudgetContributions>;
export type NewMonthlyBudgetContribution = InferInsertModel<typeof monthlyBudgetContributions>;

export type MonthlyBudgetRemainderPersist = InferSelectModel<typeof monthlyBudgetRemainders>;
export type NewMonthlyBudgetRemainder = InferInsertModel<typeof monthlyBudgetRemainders>;
