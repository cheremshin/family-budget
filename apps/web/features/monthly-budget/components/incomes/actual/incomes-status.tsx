import { FC } from 'react';

import { Label, Progress } from '@family-budget/ui';

type PropsT = {
    remaining: string;
    progress: number;
};

export const IncomesStatus: FC<PropsT> = ({ remaining, progress }) => (
    <div>
        <div className="flex justify-between">
            <Label>Осталось:</Label>
            <Label>{remaining}</Label>
        </div>
        <Progress value={progress} className="mt-2" />
    </div>
);
