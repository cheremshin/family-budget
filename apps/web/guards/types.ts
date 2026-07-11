import { Session } from '@/lib/session';
import { AuthenticatedUser } from '@/lib/user/types/authenticated-user';

export type AuthContext = {
    session: Session;
    user: AuthenticatedUser;
};
