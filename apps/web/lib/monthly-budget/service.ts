import {
    Executor,
    MonthlyBudgetItemPersist,
    NewMonthlyBudget,
    NewMonthlyBudgetItem,
    db,
    schema,
} from '@family-budget/database';
import {
    AddIncomeInput,
    type AddPlannedIncomeInput,
    MonthlyBudget,
    MonthlyBudgetClosedError,
    PlannedIncomeNotSet,
} from '@family-budget/domain/monthly-budget';

import { requireFamilyMember } from '@/lib/family';

import { getFamilyBudgetCategories } from '../budget-category';
import { insertIncome } from './actions/insert-income';
import { insertMonthlyBudgetIfMissing } from './actions/insert-monthly-budget';
import { upsertPlannedIncome } from './actions/upsert-planned-income';
import {
    mapToMonthlyBudget,
    withUpsertedIncome,
    withUpsertedPlannedIncome,
} from './monthly-budget.mappers';
import { getMonthlyBudget } from './queries/get-monthly-budget';
import { monthlyBudgetEventBus } from './realtime/bus';
import { createMonthlyBudgetChangedEvent } from './realtime/events';
import { toMonthStart } from './utils/date';

export async function ensureMonthlyBudget(
    data: NewMonthlyBudget,
    tx: Executor = db,
): Promise<MonthlyBudget> {
    const inserted = await insertMonthlyBudgetIfMissing(data, tx);

    if (inserted) {
        await seedMonthlyBudgetItems(inserted.id, data.familyId, tx);
    }

    const budget = await getMonthlyBudget(data.familyId, data.period, tx);
    if (!budget) {
        throw new Error('unreachable: budget vanished inside its own transaction');
    }

    return mapToMonthlyBudget(budget);
}

export async function setPlannedIncome(
    userId: string,
    input: AddPlannedIncomeInput,
): Promise<MonthlyBudget> {
    const familyId = await requireFamilyMember(userId);
    const period = toMonthStart(input.period);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await ensureMonthlyBudget(
            {
                familyId,
                period,
            },
            tx,
        );

        if (monthlyBudget.isClosed) {
            throw new MonthlyBudgetClosedError();
        }

        const plannedIncome = await upsertPlannedIncome(
            {
                monthlyBudgetId: monthlyBudget.id,
                userId,
                plannedAmount: input.plannedAmount,
            },
            tx,
        );

        return withUpsertedPlannedIncome(monthlyBudget, plannedIncome);
    });

    monthlyBudgetEventBus.publish(
        createMonthlyBudgetChangedEvent({
            monthlyBudgetId: budget.id,
            familyId,
            period: budget.period,
            version: budget.version,
        }),
    );

    return budget;
}

export async function addActualIncome(
    userId: string,
    input: AddIncomeInput,
): Promise<MonthlyBudget> {
    const familyId = await requireFamilyMember(userId);
    const period = toMonthStart(input.period);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await ensureMonthlyBudget(
            {
                familyId,
                period,
            },
            tx,
        );

        if (monthlyBudget.plannedIncomes.length === 0) {
            throw new PlannedIncomeNotSet();
        }

        const plannedIncome = monthlyBudget.plannedIncomes[0];

        const inserted = await insertIncome({
            plannedIncomesId: plannedIncome.id,
            amount: input.amount,
            receivedAt: input.receivedAt,
        });

        return withUpsertedIncome(monthlyBudget, inserted);
    });

    monthlyBudgetEventBus.publish(
        createMonthlyBudgetChangedEvent({
            monthlyBudgetId: budget.id,
            familyId,
            period: budget.period,
            version: budget.version,
        }),
    );

    return budget;
}

async function seedMonthlyBudgetItems(
    monthlyBudgetId: string,
    familyId: string,
    tx: Executor = db,
): Promise<MonthlyBudgetItemPersist[]> {
    const activeCategories = await getFamilyBudgetCategories(familyId);

    if (activeCategories.length === 0) {
        throw new Error(`Family [${familyId}] has no active categories to seed`);
    }

    const items: NewMonthlyBudgetItem[] = activeCategories.map((category) => ({
        monthlyBudgetId,
        budgetCategoryId: category.id,
        calculationMode: category.calculationMode,
        targetAmount: category.targetAmount,
        sortOrder: category.sortOrder,
    }));

    return await tx.insert(schema.monthlyBudgetItems).values(items).returning();
}
