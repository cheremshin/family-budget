import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
    users: {
        family: r.one.families({
            from: r.users.familyId,
            to: r.families.id,
            optional: true,
        }),
        ownedFamily: r.one.families({
            from: r.users.id,
            to: r.families.ownerId,
            alias: 'family_owner',
            optional: true,
        }),
        plannedIncomes: r.many.plannedIncomes({
            from: r.users.id,
            to: r.plannedIncomes.userId,
        }),
    },

    families: {
        owner: r.one.users({
            from: r.families.ownerId,
            to: r.users.id,
            alias: 'family_owner',
            optional: false,
        }),
        settings: r.one.familySettings({
            from: r.families.id,
            to: r.familySettings.familyId,
            optional: false,
        }),
        members: r.many.users({
            from: r.families.id,
            to: r.users.familyId,
        }),
        monthlyBudgets: r.many.monthlyBudgets({
            from: r.families.id,
            to: r.monthlyBudgets.familyId,
        }),
        budgetCategories: r.many.budgetCategories({
            from: r.families.id,
            to: r.budgetCategories.familyId,
        }),
    },

    familySettings: {
        family: r.one.families({
            from: r.familySettings.familyId,
            to: r.families.id,
            optional: false,
        }),
    },

    budgetCategories: {
        family: r.one.families({
            from: r.budgetCategories.familyId,
            to: r.families.id,
            optional: false,
        }),
        monthlyItems: r.many.monthlyBudgetItems({
            from: r.budgetCategories.id,
            to: r.monthlyBudgetItems.budgetCategoryId,
        }),
    },

    monthlyBudgets: {
        family: r.one.families({
            from: r.monthlyBudgets.familyId,
            to: r.families.id,
            optional: false,
        }),
        items: r.many.monthlyBudgetItems({
            from: r.monthlyBudgets.id,
            to: r.monthlyBudgetItems.monthlyBudgetId,
        }),
        plannedIncomes: r.many.plannedIncomes({
            from: r.monthlyBudgets.id,
            to: r.plannedIncomes.monthlyBudgetId,
        }),
    },

    monthlyBudgetItems: {
        monthlyBudget: r.one.monthlyBudgets({
            from: r.monthlyBudgetItems.monthlyBudgetId,
            to: r.monthlyBudgets.id,
            optional: false,
        }),
        category: r.one.budgetCategories({
            from: r.monthlyBudgetItems.budgetCategoryId,
            to: r.budgetCategories.id,
            optional: false,
        }),
    },

    plannedIncomes: {
        monthlyBudget: r.one.monthlyBudgets({
            from: r.plannedIncomes.monthlyBudgetId,
            to: r.monthlyBudgets.id,
            optional: false,
        }),
        user: r.one.users({
            from: r.plannedIncomes.userId,
            to: r.users.id,
            optional: false,
        }),
        incomes: r.many.incomes({
            from: r.plannedIncomes.id,
            to: r.incomes.plannedIncomesId,
        }),
    },

    incomes: {
        plannedIncome: r.one.plannedIncomes({
            from: r.incomes.plannedIncomesId,
            to: r.plannedIncomes.id,
            optional: false,
        }),
    },
}));
