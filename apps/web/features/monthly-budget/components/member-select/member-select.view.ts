export type MemberView = {
    id: string;
    name: string;
    plannedIncome: string | null;
    plannedIncomeWeight: string | null;
    isSelected: boolean;
};

export type MembersView =
    | { status: 'loading' }
    | {
          status: 'ready';
          members: MemberView[];
      };
