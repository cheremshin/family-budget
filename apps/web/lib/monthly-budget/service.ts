import { Executor, db } from '@family-budget/database';
import {
    type AddIncomeInput,
    type AddPlannedIncomeInput,
    type CloseMonthlyBudgetInput,
    type MonthlyBudget,
    MonthlyBudgetCloseBlocked,
    MonthlyBudgetNotFound,
    MonthlyBudgetPlanBlocked,
    MonthlyBudgetReceiptBlocked,
    closeBlockerOf,
    distributionOf,
    planBlockerOf,
    receiptBlockerOf,
} from '@family-budget/domain/monthly-budget';
import { Period } from '@family-budget/domain/shared';

import { familyService, requireActor } from '@/lib/family';

import { budgetCategoryService } from '../budget-category';
import { mapToClosedMonthlyBudget, mapToOpenMonthlyBudget } from './monthly-budget.mappers';
import { insertIncome } from './mutations/insert-income';
import { insertMonthlyBudgetIfMissing } from './mutations/insert-monthly-budget';
import { insertMonthlyBudgetItems } from './mutations/insert-monthly-budget-item';
import { insertMonthlyBudgetResult } from './mutations/insert-monthly-budget-result';
import { touchMonthlyBudget } from './mutations/touch-monthly-budget';
import { updateMonthlyBudget } from './mutations/update-monthly-budget';
import { upsertPlannedIncome } from './mutations/upsert-planned-income';
import { getMonthlyBudget as getMonthlyBudgetRow } from './queries/get-monthly-budget';
import { monthlyBudgetEventBus } from './realtime/bus';
import { createMonthlyBudgetChangedEvent } from './realtime/events';
import { CreateMonthlyBudgetParams } from './types';

export async function getMonthlyBudget(
    familyId: string,
    period: Period,
    tx: Executor = db,
): Promise<MonthlyBudget | undefined> {
    const row = await getMonthlyBudgetRow(familyId, period, tx);

    if (!row) return undefined;

    // Закрытый месяц состав и правило деления несет в снимке.
    if (row.isClosed) return mapToClosedMonthlyBudget(row);

    const family = await familyService.requireFamily(familyId, tx);
    const categories = await budgetCategoryService.getFamilyCategories(familyId, tx);

    return mapToOpenMonthlyBudget(row, family, categories);
}

export async function requireMonthlyBudget(
    familyId: string,
    period: Period,
    tx: Executor = db,
): Promise<MonthlyBudget> {
    const budget = await getMonthlyBudget(familyId, period, tx);

    if (!budget) {
        throw new MonthlyBudgetNotFound();
    }

    return budget;
}

export async function createMonthlyBudget(
    params: CreateMonthlyBudgetParams,
): Promise<MonthlyBudget> {
    const { budget, isCreated } = await db.transaction(async (tx) => {
        const inserted = await insertMonthlyBudgetIfMissing(params, tx);
        const budget = await requireMonthlyBudget(params.familyId, params.period, tx);
        return { budget, isCreated: inserted !== undefined };
    });

    if (isCreated) publishMonthlyBudgetChanged(params.familyId, budget);

    return budget;
}

export async function setPlannedIncome(
    userId: string,
    input: AddPlannedIncomeInput,
): Promise<MonthlyBudget> {
    const { familyId, actor } = await requireActor(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await requireMonthlyBudget(familyId, input.period, tx);

        const blocker = planBlockerOf(monthlyBudget, actor, actor.memberId);
        if (blocker) {
            throw new MonthlyBudgetPlanBlocked(blocker);
        }

        await upsertPlannedIncome(
            {
                monthlyBudgetId: monthlyBudget.id,
                userId,
                plannedAmount: input.amount,
            },
            tx,
        );

        await touchMonthlyBudget(monthlyBudget.id, tx);
        return await requireMonthlyBudget(familyId, input.period, tx);
    });

    publishMonthlyBudgetChanged(familyId, budget);

    return budget;
}

export async function addActualIncome(
    userId: string,
    input: AddIncomeInput,
): Promise<MonthlyBudget> {
    const { familyId, actor } = await requireActor(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await requireMonthlyBudget(familyId, input.period, tx);

        const blocker = receiptBlockerOf(monthlyBudget, actor, actor.memberId);
        if (blocker) {
            throw new MonthlyBudgetReceiptBlocked(blocker);
        }

        await insertIncome(
            {
                monthlyBudgetId: monthlyBudget.id,
                userId: actor.memberId,
                amount: input.amount,
                receivedAt: input.receivedAt,
            },
            tx,
        );

        await touchMonthlyBudget(monthlyBudget.id, tx);
        return await requireMonthlyBudget(familyId, input.period, tx);
    });

    publishMonthlyBudgetChanged(familyId, budget);

    return budget;
}

export async function closeMonthlyBudget(
    userId: string,
    input: CloseMonthlyBudgetInput,
): Promise<MonthlyBudget> {
    const { familyId, actor } = await requireActor(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await requireMonthlyBudget(familyId, input.period, tx);

        const distribution = distributionOf(monthlyBudget);
        const blocker = closeBlockerOf(monthlyBudget, actor, distribution);
        if (blocker) {
            throw new MonthlyBudgetCloseBlocked(blocker);
        }

        if (!distribution) {
            throw new Error('[closeMonthlyBudget] нет распределения');
        }

        await insertMonthlyBudgetItems(
            monthlyBudget.items.map((item) => ({
                monthlyBudgetId: monthlyBudget.id,
                budgetCategoryId: item.categoryId,
                categoryName: item.categoryName,
                categoryType: item.categoryType,
                calculationMode: item.calculationMode,
                targetAmount: item.targetAmount,
                sortOrder: item.sortOrder,
            })),
            tx,
        );

        const memberNames = new Map(
            monthlyBudget.memberIncomes.map((member) => [member.memberId, member.memberName]),
        );
        await insertMonthlyBudgetResult(monthlyBudget.id, distribution, memberNames, tx);

        await updateMonthlyBudget(
            monthlyBudget.id,
            {
                isClosed: true,
                budgetDivisionType: monthlyBudget.divisionType,
                personalRemainderPolicy: monthlyBudget.personalRemainderPolicy,
            },
            tx,
        );

        return await requireMonthlyBudget(familyId, input.period, tx);
    });

    publishMonthlyBudgetChanged(familyId, budget);

    return budget;
}

function publishMonthlyBudgetChanged(familyId: string, budget: MonthlyBudget): void {
    monthlyBudgetEventBus.publish(
        createMonthlyBudgetChangedEvent({
            monthlyBudgetId: budget.id,
            familyId,
            period: budget.period,
            version: budget.version,
        }),
    );
}
