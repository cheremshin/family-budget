import { FamilyMember } from './family-member';
import { FamilySettings } from './family-settings';

export type Family = {
    id: string;
    name: string;
    invitationCode: string;
    maxMembers: number;
    ownerId: string;
    settings: FamilySettings;
    members: FamilyMember[];
};
