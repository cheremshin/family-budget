import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@family-budget/ui';

import { MemberSelect } from './member-select';
import { MemberSelectSkeleton } from './member-select.skeleton';
import type { MembersStore } from './members.store';

type MemberSelectWidgetT = {
    store: MembersStore;
    className?: string;
};

export const MembersSelectWidget: FC<MemberSelectWidgetT> = observer(({ store, className }) => {
    const { view } = store;
    if (view.status === 'loading') {
        return <MemberSelectSkeleton />;
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Участники</CardTitle>
                <CardDescription>Планирование на текущий месяц</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 p-3">
                <MemberSelect members={view.members} onSelect={store.select} />
            </CardContent>
        </Card>
    );
});
