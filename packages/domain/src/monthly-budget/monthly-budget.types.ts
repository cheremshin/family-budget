import { CalculationMode } from '../budget-category';

export type Income = {
    id: string;
    amount: string;
    receivedAt: Date;
};

export type PlannedIncome = {
    id: string;
    memberId: string;
    plannedAmount: string;
    incomeReceipts: Income[];
};

export type MonthlyBudgetItem = {
    id: string;
    budgetId: string;
    calculationMode: CalculationMode;
    targetAmount: string;
    sortOrder: number;
};

export type MonthlyBudget = {
    id: string;
    period: string;
    isClosed: boolean;
    version: number;
    items: MonthlyBudgetItem[];
    plannedIncomes: PlannedIncome[];
};
