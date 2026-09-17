import { FC, useState } from 'react';

import { Eye, Inbox, Plus } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import {
    Button,
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@family-budget/ui';

import { ActualIncomesSkeleton } from './actual-incomes.skeleton';
import { ReceiptsStore } from './actual-incomes.store';
import { AddIncomeDialog } from './add-income.dialog';
import { IncomesList } from './incomes-list';

type ActualIncomesWidgetT = {
    store: ReceiptsStore;
    className?: string;
};

export const ActualIncomesWidget: FC<ActualIncomesWidgetT> = observer(({ store, className }) => {
    const { view } = store;
    const [isAddIncomeOpen, setAddIncomeOpen] = useState(false);

    if (view.status === 'hidden') return null;
    if (view.status === 'loading') return <ActualIncomesSkeleton className={className} />;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Поступления</CardTitle>
                <CardDescription>Для детализации нажмите на поступление</CardDescription>
                <CardAction>
                    <Button
                        type="button"
                        variant="outline"
                        aria-label="Добавить"
                        disabled={view.lock !== null}
                        onClick={() => setAddIncomeOpen(true)}
                    >
                        <Plus />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col justify-center gap-2">
                {view.rows.length === 0 ? (
                    <div className="flex flex-col items-center p-8 rounded-xl text-center">
                        <div className=" bg-accent rounded-full p-2">
                            <Inbox />
                        </div>
                        <h3 className="text-lg mt-1.5">Поступлений пока нет</h3>
                        {view.lock === null && (
                            <p className="text-muted-foreground">
                                Добавьте первое поступление или посмотрите общее плановое
                                распределение.
                            </p>
                        )}
                    </div>
                ) : (
                    <IncomesList rows={view.rows} onSelect={store.select} />
                )}
                <AddIncomeDialog
                    open={isAddIncomeOpen}
                    onOpenChange={setAddIncomeOpen}
                    onSubmit={store.add}
                />
                {!view.isPlanMode && (
                    <Button variant="outline" onClick={store.clearSelection}>
                        <Eye />
                        Предпросмотр по плану
                    </Button>
                )}
            </CardContent>
        </Card>
    );
});
