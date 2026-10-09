import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@family-budget/ui';

import { MemberList } from './member-list';
import type { MemberSelectVM } from './member-select.vm';

type MemberSelectWidgetT = {
    vm: MemberSelectVM;
    className?: string;
};

export const MemberSelectWidget: FC<MemberSelectWidgetT> = observer(({ vm, className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="text-lg">Участники</CardTitle>
            <CardDescription>Планирование на текущий месяц</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-3">
            <MemberList members={vm.view.members} onSelect={vm.select} />
        </CardContent>
    </Card>
));
