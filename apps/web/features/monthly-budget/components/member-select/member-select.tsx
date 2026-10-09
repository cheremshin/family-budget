'use client';

import { FC } from 'react';

import { useReadyVM } from '../../budget-scope.context';
import { MemberSelectVM } from './member-select.vm';
import { MemberSelectWidget } from './member-select.widget';

export const MemberSelect: FC<{ className?: string }> = (props) => {
    const vm = useReadyVM((ready, scope) => new MemberSelectVM(ready, scope.model));
    return <MemberSelectWidget vm={vm} {...props} />;
};
