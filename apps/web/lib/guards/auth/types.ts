import { Session } from '@/lib/entities/session';
import { UserBase } from '@/lib/entities/user-base';

export type AuthContext = {
    session: Session;
    user: UserBase;
};
