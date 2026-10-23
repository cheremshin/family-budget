/**
 * Одноразовый перенос итога закрытых месяцев
 */
import postgres from 'postgres';

import type { CalculationMode } from '@family-budget/domain/budget-category';
import type { BudgetDivisionType } from '@family-budget/domain/family';
import { type DistributionResult, distribute } from '@family-budget/domain/monthly-budget';

const DRY_RUN = process.argv.includes('--dry-run');

const LEGACY_POLICY = 'equalized';

type BudgetRow = { id: string; period: string; divisionType: BudgetDivisionType };
type ItemRow = { categoryId: string; calculationMode: CalculationMode; targetAmount: string };
type MemberRow = { memberId: string; memberName: string; plannedAmount: string };

type ClosedMonthResult = DistributionResult & { memberNames: Map<string, string> };

type Executor = postgres.Sql | postgres.TransactionSql;

const sql = postgres(process.env.DATABASE_URL!, { max: 1, transform: postgres.camel });

async function main(): Promise<void> {
    const budgets = await sql<BudgetRow[]>`
        select b.id, b.period::text as period, b.budget_division_type as division_type
        from monthly_budget b
        where b.is_closed
            and not exists (
                select 1 from monthly_budget_remainders r where r.monthly_budget_id = b.id
            )
        order by b.period`;

    console.log(`закрытых месяцев без сохранённого итога: ${budgets.length}`);

    for (const budget of budgets) {
        if (DRY_RUN) {
            print(budget, await computeResult(sql, budget));
            continue;
        }

        await sql.begin(async (tx) => {
            const result = await computeResult(tx, budget);
            print(budget, result);
            await saveResult(tx, budget.id, result);
        });
    }

    console.log(DRY_RUN ? '\n--dry-run: ничего не записано' : `\nперенесено: ${budgets.length}`);
}

async function computeResult(db: Executor, budget: BudgetRow): Promise<ClosedMonthResult> {
    const items = await db<ItemRow[]>`
        select budget_category_id as category_id, calculation_mode,
            target_amount::text as target_amount
        from monthly_budget_items
        where monthly_budget_id = ${budget.id}
        order by sort_order, id`;

    const members = await db<MemberRow[]>`
        select p.user_id as member_id, u.username as member_name,
            p.planned_amount::text as planned_amount
        from planned_incomes p
        join users u on u.id = p.user_id
        where p.monthly_budget_id = ${budget.id}
        order by p.user_id`;

    const distribution = distribute({
        divisionType: budget.divisionType,
        personalRemainderPolicy: LEGACY_POLICY,
        items,
        members,
    });

    return {
        ...distribution,
        memberNames: new Map(members.map((member) => [member.memberId, member.memberName])),
    };
}

async function saveResult(
    tx: Executor,
    monthlyBudgetId: string,
    { contributions, remainders, memberNames }: ClosedMonthResult,
): Promise<void> {
    await tx`
        update monthly_budget
        set personal_remainder_policy = ${LEGACY_POLICY}
        where id = ${monthlyBudgetId}`;

    if (contributions.length > 0) {
        await tx`insert into monthly_budget_contributions ${tx(
            contributions.map((contribution) => ({
                monthly_budget_id: monthlyBudgetId,
                member_id: contribution.memberId,
                category_id: contribution.categoryId,
                amount: contribution.amount,
            })),
        )}`;
    }

    await tx`insert into monthly_budget_remainders ${tx(
        remainders.map((remainder) => ({
            monthly_budget_id: monthlyBudgetId,
            member_id: remainder.memberId,
            member_name: memberNames.get(remainder.memberId)!,
            own_remainder: remainder.ownRemainder,
            personal_amount: remainder.personalAmount,
            settlement_amount: remainder.settlementAmount,
        })),
    )}`;
}

function print(budget: BudgetRow, { remainders, memberNames }: ClosedMonthResult): void {
    console.log(`\n${budget.period} (${budget.divisionType})`);

    for (const remainder of remainders) {
        const name = memberNames.get(remainder.memberId);
        console.log(
            `  ${name}: себе ${remainder.personalAmount}, перевод ${remainder.settlementAmount}`,
        );
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => sql.end());
