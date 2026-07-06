'use client';

import { FC, useState, useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { createFamilySchema } from '../schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateFamilyForm, CreateFamilyResult } from '../types';
import { WizardNavigation } from './wizard-navigation';
import { steps } from '../steps';
import { createFamilyAction } from '../lib/create-family.action';
import { FamilyContext } from '../contexts/family-context';

type PropsT = {
    onExit: () => void;
};

export const CreateFamilyWizard: FC<PropsT> = ({ onExit }) => {
    const [step, setStep] = useState(0);
    const [family, setFamily] = useState<CreateFamilyResult | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<CreateFamilyForm>({
        resolver: zodResolver(createFamilySchema),
        defaultValues: { name: '' },
        mode: 'onChange',
    });

    const current = steps[step];
    const StepContent = current.content;
    const isFirst = step === 0;
    const isLast = step === steps.length - 1;

    const handleNext = () => {
        if (isLast) {
            window.location.reload();
            return;
        }

        const fields = current.fields;
        startTransition(async () => {
            if (fields.length) {
                const valid = await form.trigger(fields);
                if (!valid) return;
            }

            if (step === 0) {
                try {
                    const result = await createFamilyAction(form.getValues());
                    setFamily(result);
                } catch {
                    form.setError('name', {
                        message: 'Не удалось создать семью, попробуйте еще раз',
                    });
                    return;
                }
            }

            setStep((prev) => prev + 1);
        });
    };

    const handlePrevious = () => {
        if (isFirst) {
            onExit();
            return;
        }
        setStep((prev) => prev - 1);
    };

    return (
        <FormProvider {...form}>
            <FamilyContext.Provider value={family}>
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-2xl font-bold">{current.title}</h2>
                        <p className="mt-2 text-muted-foreground">
                            {current.description}
                        </p>
                    </div>
                    <StepContent />
                    <WizardNavigation
                        isLast={isLast}
                        isLoading={isPending}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                    />
                </div>
            </FamilyContext.Provider>
        </FormProvider>
    );
};
