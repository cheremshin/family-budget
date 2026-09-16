import z from 'zod';

import {
    budgetCategoryTypeOptions,
    calculationModeOptions,
} from '../budget-category/budget-category.enums';
import { budgetDivisionTypeOptions, personalRemainderPolicyOptions } from '../family';
import { isoDateSchema, moneySchema, periodSchema, signedMoneySchema } from '../shared';

// вход

const monthlyBudgetFieldsSchema = z.object({
    period: periodSchema,
});

export const plannedIncomeFieldsSchema = z.object({
    amount: moneySchema,
});

export const incomeFieldsSchema = plannedIncomeFieldsSchema.extend({
    receivedAt: isoDateSchema,
});

export const addPlannedIncomeSchema = plannedIncomeFieldsSchema.extend(
    monthlyBudgetFieldsSchema.shape,
);
export const addIncomeSchema = incomeFieldsSchema.extend(monthlyBudgetFieldsSchema.shape);
export const closeMonthlyBudgetSchema = monthlyBudgetFieldsSchema;

export type AddPlannedIncomeInput = z.infer<typeof addPlannedIncomeSchema>;
export type AddIncomeInput = z.infer<typeof addIncomeSchema>;
export type CloseMonthlyBudgetInput = z.infer<typeof closeMonthlyBudgetSchema>;

// выход

const incomeSchema = incomeFieldsSchema.extend({
    id: z.uuid(),
});

const memberIncomeSchema = z.object({
    memberId: z.uuid(),
    memberName: z.string().min(1),
    plannedAmount: moneySchema.nullable(),
    incomeReceipts: z.array(incomeSchema),
});

export const contributionSchema = z.object({
    memberId: z.uuid(),
    categoryId: z.uuid(),
    amount: moneySchema,
});

export const memberRemainderSchema = z.object({
    memberId: z.uuid(),
    ownRemainder: signedMoneySchema,
    // неотрицателен — иначе закрытие не прошло бы гвард isOverAllocated
    personalAmount: moneySchema,
    settlementAmount: signedMoneySchema,
});

const monthlyBudgetItemSchema = z.object({
    id: z.uuid(),
    categoryId: z.uuid(),
    categoryName: z.string().min(1),
    categoryType: z.enum(budgetCategoryTypeOptions),
    calculationMode: z.enum(calculationModeOptions),
    targetAmount: moneySchema,
    sortOrder: z.number().int(),
});

const budgetBaseSchema = monthlyBudgetFieldsSchema.extend({
    id: z.uuid(),
    version: z.number().int().positive(),
    divisionType: z.enum(budgetDivisionTypeOptions),
    personalRemainderPolicy: z.enum(personalRemainderPolicyOptions),
    items: z.array(monthlyBudgetItemSchema),
});

const openMonthlyBudgetSchema = budgetBaseSchema.extend({
    isClosed: z.literal(false),
    memberIncomes: z.array(memberIncomeSchema),
});

const closedMonthlyBudgetSchema = budgetBaseSchema.extend({
    isClosed: z.literal(true),
    memberIncomes: z.array(memberIncomeSchema.extend({ plannedAmount: moneySchema })),
    contributions: z.array(contributionSchema),
    remainders: z.array(memberRemainderSchema),
});

export const monthlyBudgetSchema = z.discriminatedUnion('isClosed', [
    openMonthlyBudgetSchema,
    closedMonthlyBudgetSchema,
]);

export type Income = z.infer<typeof incomeSchema>;
export type MemberIncome = z.infer<typeof memberIncomeSchema>;
export type Contribution = z.infer<typeof contributionSchema>;
export type MonthlyBudgetItem = z.infer<typeof monthlyBudgetItemSchema>;
export type OpenMonthlyBudget = z.infer<typeof openMonthlyBudgetSchema>;
export type ClosedMonthlyBudget = z.infer<typeof closedMonthlyBudgetSchema>;
export type MonthlyBudget = z.infer<typeof monthlyBudgetSchema>;
