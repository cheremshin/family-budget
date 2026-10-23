import { Executor, db } from '@family-budget/database';
import {
    AddIncomeInput,
    type AddPlannedIncomeInput,
    CloseMonthlyBudgetInput,
    MonthlyBudget,
    MonthlyBudgetClosedError,
    MonthlyBudgetHasNoItems,
    MonthlyBudgetNotFound,
    MonthlyBudgetOverAllocated,
    MonthlyBudgetPlanIncomplete,
    PlannedIncomeNotSet,
    distribute,
    isOverAllocated,
} from '@family-budget/domain/monthly-budget';
import { Period } from '@family-budget/domain/shared';

import { familyService, requireFamilyMember, requireFamilyOwner } from '@/lib/family';

import { budgetCategoryService } from '../budget-category';
import { PERSONAL_REMAINDER_POLICY } from './configuration/personal-remainder-policy';
import { mapToClosedMonthlyBudget, mapToOpenMonthlyBudget } from './monthly-budget.mappers';
import { insertIncome } from './mutations/insert-income';
import { insertMonthlyBudgetIfMissing } from './mutations/insert-monthly-budget';
import { insertMonthlyBudgetItems } from './mutations/insert-monthly-budget-item';
import { touchMonthlyBudget } from './mutations/touch-monthly-budget';
import { updateMonthlyBudget } from './mutations/update-monthly-budget';
import { upsertPlannedIncome } from './mutations/upsert-planned-income';
import { getMonthlyBudget as getMonthlyBudgetRow } from './queries/get-monthly-budget';
import { getPlannedIncome } from './queries/get-planned-income';
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

export async function createMonthlyBudget(params: CreateMonthlyBudgetParams): Promise<MonthlyBudget> {
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
    const familyId = await requireFamilyMember(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await requireMonthlyBudget(familyId, input.period, tx);

        if (monthlyBudget.isClosed) {
            throw new MonthlyBudgetClosedError();
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
    const familyId = await requireFamilyMember(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await requireMonthlyBudget(familyId, input.period, tx);
        const plannedIncome = await getPlannedIncome(monthlyBudget.id, userId, tx);

        if (!plannedIncome) {
            throw new PlannedIncomeNotSet();
        }

        await insertIncome(
            {
                plannedIncomesId: plannedIncome.id,
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
    const familyId = await requireFamilyOwner(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await requireMonthlyBudget(familyId, input.period, tx);

        if (monthlyBudget.isClosed) {
            throw new MonthlyBudgetClosedError();
        }

        const members = monthlyBudget.memberIncomes.map((member) => {
            if (member.plannedAmount === null) {
                throw new MonthlyBudgetPlanIncomplete();
            }
            return { memberId: member.memberId, plannedAmount: member.plannedAmount };
        });

        const family = await familyService.requireFamily(familyId, tx);
        const divisionType = family.settings.budgetDivisionType;

        const distribution = distribute({
            divisionType,
            personalRemainderPolicy: PERSONAL_REMAINDER_POLICY,
            items: monthlyBudget.items,
            members,
        });
        if (isOverAllocated(distribution)) {
            throw new MonthlyBudgetOverAllocated();
        }

        if (monthlyBudget.items.length === 0) {
            throw new MonthlyBudgetHasNoItems();
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

        await updateMonthlyBudget(
            monthlyBudget.id,
            { isClosed: true, budgetDivisionType: divisionType },
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
