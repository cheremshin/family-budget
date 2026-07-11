import { db } from '@family-budget/database/connection';
import {
    Executor,
    FamilyPersist,
    schema,
    sql,
} from '@family-budget/database';

export async function lockFamilyByInvitationCode(
    invitationCode: string,
    tx: Executor = db,
): Promise<FamilyPersist | undefined> {
    const [row]: FamilyPersist[] = await tx.execute(sql`
        SELECT *
        FROM ${schema.families}
        WHERE invitation_code = ${invitationCode}
        FOR UPDATE
    `);

    return row ?? undefined;
}
