import { FamilyPersist } from '@family-budget/database';
import { BudgetDivisionType, FamilyMember, PersonalRemainderPolicy } from '@family-budget/domain/family';

export type FamilyWithRelations = FamilyPersist & {
    settings: {
        budgetDivisionType: BudgetDivisionType;
        personalRemainderPolicy: PersonalRemainderPolicy;
    };
    members: FamilyMember[];
};
