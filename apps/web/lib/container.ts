import { AuthService } from './services/auth.service';
import { UserRepository } from './infrastructure/user.repository';
import { FamilyRepository } from './infrastructure/family.repository';
import { FamilyManagementService } from './services/family-management.service';
import { SessionService } from './services/session.service';
import { FlashMessageService } from './services/flash-message.service';

export interface Repositories {
    userRepository: UserRepository;
    familyRepository: FamilyRepository;
}

export interface Services {
    authService: AuthService;
    flashMessageService: FlashMessageService;
    sessionService: SessionService;
    familyManagementService: FamilyManagementService;
}

export interface Container {
    repositories: Repositories;
    services: Services;
}

function createContainer(): Container {
    const repositories: Repositories = {
        userRepository: new UserRepository(),
        familyRepository: new FamilyRepository(),
    } as const;
    const services: Services = {
        authService: new AuthService(repositories.userRepository),
        flashMessageService: new FlashMessageService(),
        sessionService: new SessionService(),
        familyManagementService: new FamilyManagementService(
            repositories.familyRepository,
            repositories.userRepository,
        ),
    } as const;

    return {
        repositories,
        services,
    };
}

export const container = createContainer();
