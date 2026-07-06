import { Family } from '@/lib/entities/family';
import { UserBase } from '@/lib/entities/user-base';
import {
    FamilyRepository,
    mapToFamily,
} from '@/lib/infrastructure/family.repository';
import {
    mapToUserBase,
    UserRepository,
} from '@/lib/infrastructure/user.repository';
import { generateRandomCode } from '@/lib/utils/generate-random-code';
import { db } from '@family-budget/database';

const MAX_CREATE_ATTEMPTS = 10;

export class FamilyManagementService {
    constructor(
        private readonly familyRepository: FamilyRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async create(
        user: UserBase,
        familyName: string,
    ): Promise<{ user: UserBase; family: Family }> {
        if (user.familyId) {
            const family = await this.familyRepository.findById(user.familyId);
            if (family) throw new FamilyAlreadyExistsError();
        }

        const code = await this.generateUniqueCode();
        if (!code) {
            throw new GenerateFamilyInvitationCodeError();
        }

        return await db.transaction(async (tx) => {
            const createdFamily = await this.familyRepository.create(
                {
                    name: familyName,
                    invitationCode: code,
                },
                tx,
            );
            const updatedUser = await this.userRepository.update(
                {
                    id: user.id,
                    familyId: createdFamily.id,
                },
                tx,
            );

            return {
                user: mapToUserBase(updatedUser),
                family: mapToFamily(createdFamily),
            };
        });
    }

    async getFamilyByUser(user: UserBase): Promise<Family | null> {
        const familyId = user.familyId;
        if (!familyId) return null;

        const family = await this.familyRepository.findById(familyId);
        if (!family) {
            throw new Error('Семья удалена');
        }

        const familyMembers =
            await this.userRepository.findByFamilyId(familyId);
        return mapToFamily(family, familyMembers);
    }

    async acceptInvite(
        user: UserBase,
        invitationCode: string,
    ): Promise<UserBase> {
        if (user.familyId) throw new FamilyAlreadyExistsError();

        return await db.transaction(async (tx) => {
            const family = await this.familyRepository.claimSeatByCode(
                invitationCode,
                tx,
            );

            if (!family) {
                const existing =
                    await this.familyRepository.findByCode(invitationCode);
                if (!existing) throw new NoSuchFamilyCodeError();
                throw new FamilyIsFullError();
            }

            const updatedUser = await this.userRepository.update(
                {
                    id: user.id,
                    familyId: family.id,
                },
                tx,
            );

            return mapToUserBase(updatedUser);
        });
    }

    async removeUser(familyId: string, userId: string): Promise<void> {
        await db.transaction(async (tx) => {
            await this.userRepository.update(
                {
                    id: userId,
                    familyId: null,
                },
                tx,
            );
            await this.familyRepository.update(
                {
                    id: familyId,
                    isFull: false,
                },
                tx,
            );
        });
    }

    async updateInvitationCode(familyId: string): Promise<Family> {
        const code = await this.generateUniqueCode();
        if (!code) throw new GenerateFamilyInvitationCodeError();

        const updatedFamily = await this.familyRepository.update({
            id: familyId,
            invitationCode: code,
        });
        return mapToFamily(updatedFamily);
    }

    private async generateUniqueCode(): Promise<string | undefined> {
        for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
            const code = generateRandomCode();
            if (await this.familyRepository.isCodeExists(code)) {
                continue;
            }
            return code;
        }

        return undefined;
    }
}

export class FamilyError extends Error {}

export class FamilyAlreadyExistsError extends FamilyError {
    constructor() {
        super(`У вас уже есть семья!`);
    }
}

export class NoFamilyYetError extends FamilyError {
    constructor() {
        super(`У вас еще нет семьи`);
    }
}

export class FamilyCreateError extends FamilyError {
    constructor() {
        super(`Не удалось создать семью. Попробуйте позже`);
    }
}

export class GenerateFamilyInvitationCodeError extends FamilyError {
    constructor() {
        super(`Не удалось сгенерировать код-приглашение, попробуйте позже`);
    }
}

export class NoSuchFamilyCodeError extends FamilyError {
    constructor() {
        super(`Код-приглашение не действителен`);
    }
}

export class FamilyIsFullError extends FamilyError {
    constructor() {
        super(`Семья уже полная`);
    }
}
