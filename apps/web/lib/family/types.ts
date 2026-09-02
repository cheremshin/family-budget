import { FamilyPersist } from '@family-budget/database';
import { BudgetDivisionType, FamilyMember } from '@family-budget/domain/family';

export type FamilyWithRelations = FamilyPersist & {
    settings: { budgetDivisionType: BudgetDivisionType };
    members: FamilyMember[];
};
