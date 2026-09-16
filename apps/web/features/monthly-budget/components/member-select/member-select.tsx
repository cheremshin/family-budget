import { FC } from 'react';

import { cn } from '@family-budget/ui';

import { Member } from './member';
import type { MemberView } from './member-select.view';

type MemberSelectT = {
    members: MemberView[];
    onSelect: (memberId: string) => void;
    className?: string;
};

export const MemberSelect: FC<MemberSelectT> = ({ members, onSelect, className }) => (
    <div className={cn('flex flex-col gap-4', className)}>
        {members.map((member) => (
            <Member
                key={member.id}
                name={member.name}
                plannedIncome={member.plannedIncome}
                plannedIncomeWeight={member.plannedIncomeWeight}
                isSelected={member.isSelected}
                onSelect={() => onSelect(member.id)}
            />
        ))}
    </div>
);
