import { Session } from '@/lib/session';
import { Family } from '@family-budget/domain/family';
import { AuthenticatedUser } from '@family-budget/domain/user';

export type RequestContext = {
    session: Session | null;
    user: AuthenticatedUser | null;
    family: Family | null;
};
