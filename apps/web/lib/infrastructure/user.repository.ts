import {
    and,
    db,
    eq,
    Executor,
    ne,
    schema,
    SQL,
    UserPersist,
} from '@family-budget/database';
import { UserBase } from '../entities/user-base';
import { cleanObject } from '../utils/clean-object';

export class UserRepository {
    async findById(id: string): Promise<UserPersist | null> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, id),
        });

        return user ?? null;
    }

    async findByUsername(username: string): Promise<UserPersist | null> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.username, username),
        });
        return user ?? null;
    }

    async findByFamilyId(
        familyId: string,
        exceptUserId?: string,
    ): Promise<UserPersist[]> {
        const conditions: SQL[] = [eq(schema.users.familyId, familyId)];

        if (exceptUserId) {
            conditions.push(ne(schema.users.id, exceptUserId));
        }

        return await db.query.users.findMany({
            where: and(...conditions),
        });
    }

    async create(
        data: {
            username: string;
            passwordHash: string;
        },
        tx: Executor = db,
    ): Promise<UserPersist> {
        const [row] = await tx.insert(schema.users).values(data).returning();
        return row;
    }

    async update(
        data: {
            id: string;
            username?: string;
            passwordHash?: string;
            familyId?: string | null;
        },
        tx: Executor = db,
    ): Promise<UserPersist> {
        const { id, ...rest } = data;
        const [row] = await tx
            .update(schema.users)
            .set(cleanObject(rest))
            .where(eq(schema.users.id, id))
            .returning();

        if (!row) {
            throw new Error(`User [${id}] not found`);
        }

        return row;
    }
}

export function mapToUserBase(user: UserPersist): UserBase {
    return {
        id: user.id,
        username: user.username,
        familyId: user.familyId,
    };
}
