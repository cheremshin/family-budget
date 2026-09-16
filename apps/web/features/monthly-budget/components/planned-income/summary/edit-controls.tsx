import { FC } from 'react';

import { Check, Edit3, X } from 'lucide-react';

import { Button } from '@family-budget/ui';

type EditControlsT = {
    formId: string;
    isEditing: boolean;
    isSubmitting: boolean;
    onEdit: () => void;
    onCancel: () => void;
};

export const EditControls: FC<EditControlsT> = ({
    formId,
    isEditing,
    isSubmitting,
    onEdit,
    onCancel,
}) => {
    if (isEditing) {
        return (
            <div className="flex gap-2">
                <Button type="submit" form={formId} disabled={isSubmitting}>
                    <Check />
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} aria-label="Отмена">
                    <X />
                </Button>
            </div>
        );
    }

    return (
        <Button variant="outline" type="button" onClick={onEdit} aria-label="Редактировать">
            <Edit3 />
            Изменить
        </Button>
    );
};
