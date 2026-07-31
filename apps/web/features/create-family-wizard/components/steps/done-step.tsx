import { FC } from 'react';

import { PartyPopper } from 'lucide-react';

export const DoneStep: FC = () => {
    return (
        <div className="flex items-center justify-center py-6">
            <PartyPopper className="size-16 text-primary" />
        </div>
    );
};
