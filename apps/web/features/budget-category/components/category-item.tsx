import { calculationModeLabels, formatMoney } from '@/lib/i18n/ru/calculation-mode';
import { categoryTypeLabels } from '@/lib/i18n/ru/category-type';
import { formatPercent } from '@/shared/format-percent';
import { BudgetCategory } from '@family-budget/domain/budget-category';
import { Button, Card, cn } from '@ui/index';
import { Settings2, Trash2 } from 'lucide-react';
import { FC } from 'react';

type PropsT = {
    category: BudgetCategory;
    onEdit: () => void;
    onDelete: () => void;
};

export const CategoryItem: FC<PropsT> = ({ category, onEdit, onDelete }) => {
    const formattedAmount =
        category.calculationMode === 'absolute'
            ? formatMoney(category.targetAmount)
            : formatPercent(category.targetAmount);

    return (
        <Card className="w-full p-5 flex justify-between group">
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-bold">{category.name}</span>
                    {category.isSystem && (
                        <span className="text-[10px] uppercase bg-badge-system text-badge-system-foreground px-2 py-0.5 rounded-full border border-badge-system-border">
                            Системная
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span
                        className={cn(
                            'font-semibold text-[10px] uppercase tracking-widest',
                            category.type === 'savings' ? 'text-green-800' : 'text-red-800',
                        )}
                    >
                        {categoryTypeLabels[category.type]}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border"> </span>
                    <span className="font-semibold text-[10px] uppercase tracking-widest">
                        {calculationModeLabels[category.calculationMode]}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div>
                    <p className="font-bold">{formattedAmount}</p>
                    <p className="mt-1 font-semibold text-[10px] text-muted-foreground text-right uppercase tracking-widest">
                        Цель
                    </p>
                </div>
                <Button variant="ghost" onClick={onEdit}>
                    <Settings2 />
                </Button>
                {!category.isSystem && (
                    <Button variant="destructive" onClick={onDelete}>
                        <Trash2 />
                    </Button>
                )}
            </div>
        </Card>
    );
};
