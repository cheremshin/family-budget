'use client';

import { BudgetCategory, CategoryFormValues } from '@family-budget/domain/budget-category';
import { FC, useState } from 'react';
import { CategoryItem } from './components/category-item';
import { Dialog, DialogContent } from '@ui/index';
import { CategoryForm } from './components/category.form';
import { updateCategoryAction } from './lib/update-category.action';
import { archiveCategoryAction } from './lib/archive-category.action';

type PropsT = {
    categories: BudgetCategory[];
};

export const CategoryList: FC<PropsT> = ({ categories }) => {
    const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

    const handleSubmit = async (values: CategoryFormValues) => {
        if (!editingCategory) return;
        await updateCategoryAction(editingCategory.id, values);
        setEditingCategory(null);
    };

    const handleArchiveCategory = async (categoryId: string) => {
        await archiveCategoryAction(categoryId);
    };

    if (categories.length === 0) {
        return <p className="text-sm text-muted-foreground">Категорий нет</p>;
    }

    return (
        <>
            <div className="grid gap-4">
                {categories.map((category) => (
                    <CategoryItem
                        key={category.id}
                        category={category}
                        onEdit={() => setEditingCategory(category)}
                        onDelete={() => handleArchiveCategory(category.id)}
                    />
                ))}
            </div>
            <Dialog
                open={editingCategory !== null}
                onOpenChange={(open) => !open && setEditingCategory(null)}
            >
                <DialogContent>
                    {editingCategory && (
                        <CategoryForm
                            key={editingCategory.id}
                            defaultValues={{
                                name: editingCategory.name,
                                type: editingCategory.type,
                                calculationMode: editingCategory.calculationMode,
                                targetAmount: editingCategory.targetAmount,
                            }}
                            onSubmit={handleSubmit}
                            isSystem={editingCategory.isSystem}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
