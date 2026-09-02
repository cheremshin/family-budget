import { FC, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { FormProvider, useForm } from 'react-hook-form';

import { Family, createFamilySchema } from '@family-budget/domain/family';

import { FamilyContext } from '../contexts/family-context';
import { createFamilyAction } from '../lib/create-family.action';
import { steps } from '../steps';
import { CreateFamilyForm } from '../types';
import { WizardNavigation } from './wizard-navigation';

type PropsT = {
    onExitAction: () => void;
};

export const CreateFamilyWizard: FC<PropsT> = ({ onExitAction }) => {
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [family, setFamily] = useState<Family | null>(null);
    const [isPending, startTransition] = useTransition();

    const { executeAsync: executeAction } = useAction(createFamilyAction);

    const form = useForm<CreateFamilyForm>({
        resolver: zodResolver(createFamilySchema),
        defaultValues: { name: '', budgetDivisionType: 'in_proportion' },
        mode: 'onChange',
    });

    const current = steps[step];
    const StepContent = current.content;
    const isFirst = step === 0;
    const isLast = step === steps.length - 1;

    const validateCurrentStep = async () => {
        const fields = current.fields;

        if (fields.length) {
            const valid = await form.trigger(fields);
            if (!valid) return false;
        }

        return true;
    };

    const createFamily = async () => {
        try {
            const result = await executeAction(form.getValues());

            if (!result.data) {
                form.setError('form', {
                    message: 'Не удалось создать семью',
                });
                return { success: false };
            }

            setFamily(result.data);
            return { success: true };
        } catch {
            form.setError('form', {
                message: 'Не удалось создать семью',
            });
            return { success: false };
        }
    };

    const finishWizard = () => {
        router.push('/home');
    };

    const handleNext = () => {
        startTransition(async () => {
            const valid = await validateCurrentStep();
            if (!valid) return;

            if (current.actionStep) {
                const result = await createFamily();
                if (!result.success) return;
            }

            if (isLast) {
                finishWizard();
                return;
            }

            setStep((prev) => prev + 1);
        });
    };

    const handlePrevious = () => {
        if (isFirst) {
            onExitAction();
            return;
        }

        if (!current.allowBack) return;

        setStep((prev) => prev - 1);
    };

    return (
        <FormProvider {...form}>
            <FamilyContext value={{ family }}>
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-2xl font-bold">{current.title}</h2>
                        <p className="mt-4 text-muted-foreground">{current.description}</p>
                    </div>
                    <StepContent />
                    <WizardNavigation
                        isLast={isLast}
                        isLoading={isPending}
                        navigationBackLocked={!current.allowBack}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                    />
                </div>
            </FamilyContext>
        </FormProvider>
    );
};
