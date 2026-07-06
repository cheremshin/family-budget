import { UserBase } from './user-base';

export type Family = {
    id: string;
    name: string;
    invitationCode: string;
    maxMembers: number;
    members: UserBase[];
};
