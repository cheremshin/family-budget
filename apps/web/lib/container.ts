import { AuthService } from './services/auth.service';
import { UserRepository } from './infrastructure/user.repository';

export interface Repositories {
    userRepository: UserRepository;
}

export interface Services {
    auth: AuthService;
}

let repositories: Repositories | undefined;
let services: Services | undefined;

export function getRepositories(): Repositories {
    if (repositories) return repositories;

    const userRepository = new UserRepository();

    repositories = {
        userRepository,
    };
    return repositories;
}

export function getServices(): Services {
    if (services) return services;

    const auth = new AuthService(getRepositories().userRepository);

    services = {
        auth,
    };
    return services;
}
