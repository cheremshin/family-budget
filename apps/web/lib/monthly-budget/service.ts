import {
    Executor,
    NewMonthlyBudgetItem,
    UpdateMonthlyBudgetItem,
    db,
} from '@family-budget/database';
import {
    AddIncomeInput,
    type AddPlannedIncomeInput,
    MonthlyBudget,
    MonthlyBudgetClosedError,
    MonthlyBudgetNotFound,
    MonthlyBudgetOverAllocated,
    MonthlyBudgetPlanIncomplete,
    PlannedIncomeNotSet,
    distribute,
    hasOverAllocation,
} from '@family-budget/domain/monthly-budget';
import { Period } from '@family-budget/domain/shared';

import { familyService, requireFamilyMember, requireFamilyOwner } from '@/lib/family';

import { budgetCategoryService } from '../budget-category';
import { mapToMonthlyBudget } from './monthly-budget.mappers';
import { deleteMonthlyBudgetItem } from './mutations/delete-monthly-budget-item';
import { insertIncome } from './mutations/insert-income';
import { insertMonthlyBudgetIfMissing } from './mutations/insert-monthly-budget';
import { insertMonthlyBudgetItems } from './mutations/insert-monthly-budget-item';
import { updateMonthlyBudget } from './mutations/update-monthly-budget';
import { updateMonthlyBudgetItem } from './mutations/update-monthly-budget-item';
import { upsertPlannedIncome } from './mutations/upsert-planned-income';
import { getMonthlyBudget as getMonthlyBudgetRow } from './queries/get-monthly-budget';
import { getPlannedIncome } from './queries/get-planned-income';
import { monthlyBudgetEventBus } from './realtime/bus';
import { createMonthlyBudgetChangedEvent } from './realtime/events';
import { EnsureMonthlyBudgetParams } from './types';

export async function getMonthlyBudget(
    familyId: string,
    period: Period,
    tx: Executor = db,
): Promise<MonthlyBudget | undefined> {
    const row = await getMonthlyBudgetRow(familyId, period, tx);

    if (!row) return undefined;

    const members = row.isClosed ? [] : await familyService.getMembers(familyId, tx);

    return mapToMonthlyBudget(row, members);
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

export async function ensureMonthlyBudget(
    params: EnsureMonthlyBudgetParams,
    tx: Executor = db,
): Promise<MonthlyBudget> {
    await insertMonthlyBudgetIfMissing(params, tx);

    const budget = await requireMonthlyBudget(params.familyId, params.period, tx);

    if (budget.isClosed) {
        return budget;
    }

    const changed = await syncMonthlyBudgetItems(budget, params.familyId, tx);

    return changed ? await requireMonthlyBudget(params.familyId, params.period, tx) : budget;
}

export async function setPlannedIncome(
    userId: string,
    input: AddPlannedIncomeInput,
): Promise<MonthlyBudget> {
    const familyId = await requireFamilyMember(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await ensureMonthlyBudget({ familyId, period: input.period }, tx);

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

        await updateMonthlyBudget(monthlyBudget.id, { version: monthlyBudget.version + 1 }, tx);
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
        const monthlyBudget = await ensureMonthlyBudget({ familyId, period: input.period }, tx);
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

        await updateMonthlyBudget(monthlyBudget.id, { version: monthlyBudget.version + 1 }, tx);
        return await requireMonthlyBudget(familyId, input.period, tx);
    });

    publishMonthlyBudgetChanged(familyId, budget);

    return budget;
}

export async function closeMonthlyBudget(userId: string, period: Period): Promise<MonthlyBudget> {
    const familyId = await requireFamilyOwner(userId);

    const budget = await db.transaction(async (tx) => {
        const monthlyBudget = await ensureMonthlyBudget({ familyId, period }, tx);

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

        const distribution = distribute({ divisionType, items: monthlyBudget.items, members });
        if (hasOverAllocation(distribution)) {
            throw new MonthlyBudgetOverAllocated();
        }

        await updateMonthlyBudget(
            monthlyBudget.id,
            {
                isClosed: true,
                budgetDivisionType: divisionType,
                version: monthlyBudget.version + 1,
            },
            tx,
        );

        return await requireMonthlyBudget(familyId, period, tx);
    });

    publishMonthlyBudgetChanged(familyId, budget);

    return budget;
}

async function syncMonthlyBudgetItems(
    budget: MonthlyBudget,
    familyId: string,
    tx: Executor = db,
): Promise<boolean> {
    const activeCategories = await budgetCategoryService.getFamilyCategories(familyId, tx);

    if (activeCategories.length === 0) {
        throw new Error(`Family [${familyId}] has no active categories`);
    }

    const itemByCategory = new Map(budget.items.map((item) => [item.categoryId, item]));
    const activeCategoryIds = new Set(activeCategories.map((category) => category.id));

    const missing: NewMonthlyBudgetItem[] = [];
    const outdated: Array<{ id: string; data: UpdateMonthlyBudgetItem }> = [];

    for (const category of activeCategories) {
        const item = itemByCategory.get(category.id);

        if (!item) {
            missing.push({
                monthlyBudgetId: budget.id,
                budgetCategoryId: category.id,
                calculationMode: category.calculationMode,
                targetAmount: category.targetAmount,
                sortOrder: category.sortOrder,
            });
            continue;
        }

        if (
            item.calculationMode !== category.calculationMode ||
            item.targetAmount !== category.targetAmount ||
            item.sortOrder !== category.sortOrder
        ) {
            outdated.push({
                id: item.id,
                data: {
                    calculationMode: category.calculationMode,
                    targetAmount: category.targetAmount,
                    sortOrder: category.sortOrder,
                },
            });
        }
    }

    const orphaned = budget.items.filter((item) => !activeCategoryIds.has(item.categoryId));

    if (missing.length === 0 && outdated.length === 0 && orphaned.length === 0) {
        return false;
    }

    if (missing.length > 0) {
        await insertMonthlyBudgetItems(missing, tx);
    }

    for (const { id, data } of outdated) {
        await updateMonthlyBudgetItem(id, data, tx);
    }

    for (const item of orphaned) {
        await deleteMonthlyBudgetItem(item.id, tx);
    }

    return true;
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
