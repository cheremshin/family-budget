import { Credentials } from '@/lib/entities/credentials';
import { UserBase } from '@/lib/entities/user-base';
import {
    mapToUserBase,
    UserRepository,
} from '@/lib/infrastructure/user.repository';
import bcrypt from 'bcryptjs';

export class AuthService {
    constructor(private readonly userRepository: UserRepository) {}

    async signIn(credentials: Credentials): Promise<UserBase> {
        const username = credentials.username.toLowerCase();
        const existing = await this.userRepository.findByUsername(username);

        const validCredentials =
            existing &&
            (await bcrypt.compare(credentials.password, existing.passwordHash));

        if (!validCredentials) {
            throw new SignInError();
        }

        return mapToUserBase(existing);
    }

    async signUp(credentials: Credentials): Promise<UserBase> {
        const username = credentials.username.toLowerCase();
        const existing = await this.userRepository.findByUsername(username);

        if (existing) {
            throw new SignUpError();
        }

        const passwordHash = await bcrypt.hash(credentials.password, 12);
        const newUser = await this.userRepository.create({
            username,
            passwordHash,
        });

        return mapToUserBase(newUser);
    }
}

export class AuthError extends Error {}

export class SignInError extends AuthError {
    constructor() {
        super(`Неверный логин или пароль`);
    }
}

export class SignUpError extends AuthError {
    constructor() {
        super(`Пользователь с таким именем уже существует`);
    }
}
