import { FC } from 'react';

import { CalendarOff } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@family-budget/ui';

export const NotParticipantView: FC = () => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg flex gap-2">
                <CalendarOff />
                Месяц закрыт без вашего участия
            </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
            В этом месяце у вас не было планового дохода
        </CardContent>
    </Card>
);
