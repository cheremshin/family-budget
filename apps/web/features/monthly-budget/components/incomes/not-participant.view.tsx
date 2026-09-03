import { FC } from 'react';

import { CalendarOff } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@family-budget/ui';

type PropsT = {
    className?: string;
};

export const NotParticipantView: FC<PropsT> = ({ className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="flex gap-2 text-lg">
                <CalendarOff />
                Месяц закрыт без вашего участия
            </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
            В этом месяце у вас не было планового дохода
        </CardContent>
    </Card>
);
