'use client';

import { useState } from 'react';

import { Button, Dialog, DialogContent, DialogTrigger } from '@ui/index';
import { Plus } from 'lucide-react';

import { CategoryFormValues } from '@family-budget/domain/budget-category';

import { CategoryForm } from './components/category.form';
import { createCategoryAction } from './lib/create-category.action';

export const CreateCategoryButton = () => {
    const [open, setOpen] = useState(false);

    const handleSubmit = async (values: CategoryFormValues) => {
        await createCategoryAction(values);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    Создать <Plus />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <CategoryForm onSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    );
};
