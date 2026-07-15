import {
    db,
    Executor,
    FamilySettingsPersist,
    NewFamilySettings,
    schema,
} from '@family-budget/database';

export async function insertFamilySettings(
    data: NewFamilySettings,
    tx: Executor = db,
): Promise<FamilySettingsPersist> {
    const [row] = await tx.insert(schema.familySettings).values(data).returning();
    return row;
}
