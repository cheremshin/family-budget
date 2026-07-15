export const budgetDivisionTypeOptions = ['in_half', 'in_proportion'] as const;
export type BudgetDivisionType = (typeof budgetDivisionTypeOptions)[number];

export type FamilySettings = {
    budgetDivisionType: BudgetDivisionType;
};

export type FamilyMember = {
    id: string;
    username: string;
};

export type Family = {
    id: string;
    name: string;
    invitationCode: string;
    maxMembers: number;
    ownerId: string;
    settings: FamilySettings;
    members: FamilyMember[];
};
