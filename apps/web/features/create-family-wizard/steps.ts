import { CreateFamilyStep } from './types';
import { NameStep } from './components/steps/name-step';
import { InviteStep } from './components/steps/invite-step';
import { DoneStep } from './components/steps/done-step';

export const steps: CreateFamilyStep[] = [
    {
        title: 'Как назовем вашу семью?',
        description:
            'Это название будут видеть все участники, в будущем его можно поменять',
        content: NameStep,
        fields: ['name'] as const,
    },
    {
        title: 'Отправьте ссылку-приглашение',
        description: 'Далее найти ее можно в настройках',
        content: InviteStep,
        fields: [] as const,
    },
    {
        title: 'Готово!',
        description: 'Ваш семейный аккаунт готов к использованию!',
        content: DoneStep,
        fields: [] as const,
    },
] as const;
