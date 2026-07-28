import { CreateFamilyStep } from './types';
import { NameStep } from './components/steps/name-step';
import { InviteStep } from './components/steps/invite-step';
import { DoneStep } from './components/steps/done-step';
import { BudgetTypeStep } from './components/steps/budget-type-step';

export const steps: CreateFamilyStep[] = [
    {
        title: 'Как назовем вашу семью?',
        description: 'Это название будут видеть все участники, в будущем его можно поменять',
        content: NameStep,
        fields: ['name'] as const,
        actionStep: false,
        allowBack: true,
    },
    {
        title: 'Выберите тип деления семейного бюджета',
        description:
            'Бюджет может делиться пропорционально доходу каждого или поровну, в будущем его можно поменять',
        content: BudgetTypeStep,
        fields: ['budgetDivisionType'] as const,
        actionStep: true,
        allowBack: true,
    },
    {
        title: 'Отправьте ссылку-приглашение',
        description: 'Далее найти ее можно в настройках',
        content: InviteStep,
        fields: [] as const,
        actionStep: false,
        allowBack: false,
    },
    {
        title: 'Готово!',
        description:
            'Ваш семейный аккаунт готов к использованию! Также рекомендуем зайти на страницу «Категории», чтобы настроить две базовые категории: накопления и расходы.',
        content: DoneStep,
        fields: [] as const,
        actionStep: false,
        allowBack: true,
    },
] as const;
