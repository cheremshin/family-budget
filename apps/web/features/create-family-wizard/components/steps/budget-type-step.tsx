import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateFamilyForm } from '../../types';
import { Label, RadioGroup, RadioGroupItem } from '@ui/index';

export const BudgetTypeStep: FC = () => {
    const { setValue, watch } = useFormContext<CreateFamilyForm>();
    const selectedType = watch('budgetDivisionType');

    return (
        <div className="flex flex-col gap-2">
            <Label>Тип деления бюджета</Label>
            <RadioGroup
                value={selectedType}
                onValueChange={(value: 'in_half' | 'in_proportion') =>
                    setValue('budgetDivisionType', value)
                }
                className="flex flex-col"
            >
                <div className="flex items-center gap-3">
                    <RadioGroupItem value="in_proportion" id="in-proportion" />
                    <Label htmlFor="in-proportion">Пропорционально</Label>
                </div>
                <div className="flex items-center gap-3">
                    <RadioGroupItem value="in_half" id="in-half" />
                    <Label htmlFor="in-half">Поровну</Label>
                </div>
            </RadioGroup>
        </div>
    );
};
