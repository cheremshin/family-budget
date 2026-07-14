import { sql } from 'drizzle-orm';
import { AnyPgColumn, check } from 'drizzle-orm/pg-core';

export function auditNotInFutureChecks(
    tableName: string,
    columns: { createdAt: AnyPgColumn; updatedAt: AnyPgColumn },
) {
    return [
        check(
            `${tableName}__created_at_not_in_future_check`,
            sql`${columns.createdAt} <= CURRENT_TIMESTAMP`,
        ),
        check(
            `${tableName}__updated_at_not_in_future_check`,
            sql`${columns.updatedAt} <= CURRENT_TIMESTAMP`,
        ),
    ];
}

/**
 * Guard на непустую lowercase строку
 */
export function lowercaseNonEmptyCheck(name: string, column: AnyPgColumn) {
    return check(name, sql`(length(trim(${column})) > 0) AND (lower(${column}) = ${column})`);
}

/**
 * Guard на непустую строку
 */
export function nonEmptyCheck(name: string, column: AnyPgColumn) {
    return check(name, sql`length(trim(${column})) > 0`);
}

/**
 * Guard на валидность целевой суммы в зависимости от типа подсчетов
 */
export function targetAmountConsistencyCheck(
    tableName: string,
    calculationMode: AnyPgColumn,
    targetAmount: AnyPgColumn,
) {
    return check(
        `${tableName}__target_amount_consistency_check`,
        sql`
            (${calculationMode} = 'relative' AND ${targetAmount} BETWEEN 0 AND 100)
            OR
            (${calculationMode} = 'absolute' AND ${targetAmount} >= 0)
        `,
    );
}
