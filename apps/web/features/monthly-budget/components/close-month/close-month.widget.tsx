
import { FC, useState } from 'react';

import { HelpCircle, Snowflake } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import {
    Button,
    Card,
    CardDescription,
    CardTitle,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@family-budget/ui';

import type { CloseMonthVM } from './close-month.vm';

type CloseMonthWidgetT = {
    vm: CloseMonthVM;
    className?: string;
};

export const CloseMonthWidget: FC<CloseMonthWidgetT> = observer(({ vm, className }) => {
    const [isConfirming, setConfirming] = useState(false);
    const { view } = vm;

    if (view.status === 'hidden') return null;

    const handleOpenChange = (open: boolean) => {
        if (open) vm.prepare();
        setConfirming(open);
    };

    const handleConfirm = async () => {
        const result = await vm.close();
        if (result.ok) setConfirming(false);
    };

    return (
        <Card className={className}>
            <div className="flex justify-between px-(--card-spacing)">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-teal-700/10 text-primary flex items-center justify-center rounded-xl">
                        <Snowflake />
                    </div>
                    <div>
                        <CardTitle className="flex items-center gap-1.5 text-lg">
                            Зафиксировать бюджет
                            <Popover>
                                <PopoverTrigger className="text-muted-foreground hover:text-foreground">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                </PopoverTrigger>
                                <PopoverContent>
                                    Все члены семьи установили плановый доход. Пока месяц не
                                    заморожен, вы находитесь в режиме предпросмотра и можете менять
                                    категории в настройках для поиска лучшего плана на месяц! После
                                    заморозки данные становятся историческими и не могут быть
                                    изменены.
                                </PopoverContent>
                            </Popover>
                        </CardTitle>
                        <CardDescription>
                            Вы можете зафиксировать распределение текущего месяца
                        </CardDescription>
                    </div>
                </div>
                <Button onClick={() => handleOpenChange(true)}>Зафиксировать</Button>
            </div>

            <Dialog open={isConfirming} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Зафиксировать бюджет месяца?</DialogTitle>
                        <DialogDescription>
                            Распределение станет историческим. Состав категорий и планы больше
                            нельзя будет изменить - действие необратимо.
                        </DialogDescription>
                    </DialogHeader>
                    {view.error && <p className="text-destructive text-sm">{view.error}</p>}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Отмена
                            </Button>
                        </DialogClose>
                        <Button onClick={handleConfirm} disabled={view.isPending}>
                            {view.isPending ? 'Фиксируем…' : 'Зафиксировать'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
});
