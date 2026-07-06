import { FC } from 'react';
import { Button } from '@ui/index';

type PropsT = {
    isLast: boolean;
    isLoading: boolean;
    onPrevious: () => void;
    onNext: () => void;
};

export const WizardNavigation: FC<PropsT> = ({
    isLast,
    isLoading,
    onPrevious,
    onNext,
}) => {
    return (
        <div className="flex justify-between gap-3">
            <Button
                type="button"
                variant="secondary"
                disabled={isLoading}
                onClick={onPrevious}
            >
                Назад
            </Button>
            <Button type="button" disabled={isLoading} onClick={onNext}>
                {isLast ? 'Готово' : 'Далее'}
            </Button>
        </div>
    );
};
