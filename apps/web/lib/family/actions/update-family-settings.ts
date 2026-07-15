import {
    db,
    eq,
    Executor,
    FamilySettingsPersist,
    schema,
    UpdateFamilySettings,
} from '@family-budget/database';

export async function updateFamilySettings(
    id: string,
    data: UpdateFamilySettings,
    tx: Executor = db,
): Promise<FamilySettingsPersist> {
    const [row] = await tx
        .update(schema.familySettings)
        .set(data)
        .where(eq(schema.familySettings.familyId, id))
        .returning();

    return row;
}
