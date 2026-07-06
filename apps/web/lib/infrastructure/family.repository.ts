import {
    and,
    db,
    eq,
    Executor,
    FamilyPersist,
    lt,
    schema,
    sql,
    UserPersist,
} from '@family-budget/database';
import { Family } from '../entities/family';
import { cleanObject } from '../utils/clean-object';
import { mapToUserBase } from './user.repository';

export class FamilyRepository {
    async findById(familyId: string): Promise<FamilyPersist | null> {
        const family = await db.query.families.findFirst({
            where: eq(schema.families.id, familyId),
        });
        return family ?? null;
    }

    async findByCode(code: string): Promise<FamilyPersist | null> {
        const family = await db.query.families.findFirst({
            where: eq(schema.families.invitationCode, code),
        });
        return family ?? null;
    }

    async create(
        data: {
            name: string;
            invitationCode: string;
        },
        tx: Executor = db,
    ): Promise<FamilyPersist> {
        const [row] = await tx
            .insert(schema.families)
            .values({ ...data })
            .returning();
        return row;
    }

    async delete(familyId: string, tx: Executor = db): Promise<void> {
        await tx
            .delete(schema.families)
            .where(eq(schema.families.id, familyId));
    }

    async isCodeExists(code: string): Promise<boolean> {
        const exists = await db.query.families.findFirst({
            where: eq(schema.families.invitationCode, code),
        });
        return !!exists;
    }

    async update(
        data: {
            id: string;
            name?: string;
            invitationCode?: string;
            isFull?: boolean;
        },
        tx: Executor = db,
    ): Promise<FamilyPersist> {
        const { id, ...rest } = data;
        const [row] = await tx
            .update(schema.families)
            .set(cleanObject(rest))
            .where(eq(schema.families.id, id))
            .returning();

        if (!row) throw new Error(`Family [${id}] not found`);
        return row;
    }

    async claimSeatByCode(
        code: string,
        tx: Executor = db,
    ): Promise<FamilyPersist | null> {
        const [row] = await tx
            .update(schema.families)
            .set({ membersCount: sql`${schema.families.membersCount} + 1` })
            .where(
                and(
                    eq(schema.families.invitationCode, code),
                    lt(
                        schema.families.membersCount,
                        schema.families.maxMembers,
                    ),
                ),
            )
            .returning();
        return row ?? null;
    }
}

export function mapToFamily(
    family: FamilyPersist,
    members: UserPersist[] = [],
): Family {
    return {
        id: family.id,
        name: family.name,
        invitationCode: family.invitationCode,
        maxMembers: family.maxMembers,
        members: members.map((item) => mapToUserBase(item)),
    };
}
