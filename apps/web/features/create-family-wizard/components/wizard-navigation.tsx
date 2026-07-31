import { FC } from 'react';

import { Button } from '@ui/index';

type PropsT = {
    isLast: boolean;
    isLoading: boolean;
    navigationBackLocked: boolean;
    onPrevious: () => void;
    onNext: () => void;
};

export const WizardNavigation: FC<PropsT> = ({
    isLast,
    isLoading,
    navigationBackLocked,
    onPrevious,
    onNext,
}) => {
    return (
        <div className="flex gap-3">
            <Button
                type="button"
                variant="ghost"
                disabled={isLoading || navigationBackLocked}
                onClick={onPrevious}
                className="flex-1"
            >
                Назад
            </Button>
            <Button type="button" disabled={isLoading} onClick={onNext} className="flex-1">
                {isLast ? 'Готово' : 'Далее'}
            </Button>
        </div>
    );
};
