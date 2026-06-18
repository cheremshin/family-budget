import { Credentials } from '@/lib/entities/credentials';
import { User } from '@/lib/entities/user';
import {
    mapToUser,
    UserRepository,
} from '@/lib/infrastructure/user.repository';
import bcrypt from 'bcryptjs';

export class AuthService {
    constructor(private readonly userRepository: UserRepository) {}

    async signIn(credentials: Credentials): Promise<User> {
        const username = credentials.username.toLowerCase();
        const existing = await this.userRepository.findByUsername(username);

        const validCredentials =
            existing &&
            (await bcrypt.compare(credentials.password, existing.passwordHash));

        if (!validCredentials) {
            throw new SignInError();
        }

        return mapToUser(existing);
    }

    async signUp(credentials: Credentials): Promise<User> {
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

        return mapToUser(newUser);
    }
}

export class SignInError extends Error {
    constructor() {
        super(`Неверный логин или пароль`);
    }
}

export class SignUpError extends Error {
    constructor() {
        super(`Пользователь с таким именем уже существует`);
    }
}
