import { Session } from '@/lib/session';
import { AuthenticatedUser } from '@/lib/user';
import { Family } from '@/lib/family';

export type RequestContext = {
    session: Session | null;
    user: AuthenticatedUser | null;
    family: Family | null;
};
