'use client';

import { FC, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/index';
import { Check, Copy, RefreshCcw } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';

import { refreshInvitationCodeAction } from './lib/refresh-invitation-code.action';

type PropsT = {
    invitationCode: string;
};

export const FamilyInvitationCode: FC<PropsT> = ({ invitationCode }) => {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const { executeAsync: executeAction } = useAction(refreshInvitationCodeAction);

    const handleCopy = async (type: 'code' | 'link') => {
        const value =
            type === 'code'
                ? invitationCode
                : `${window.location.origin}/accept-invite/${invitationCode}`;
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleRefreshInvitationCode = async () => {
        await executeAction();
        router.refresh();
    };

    return (
        <Card className="bg-primary text-white">
            <CardHeader>
                <CardTitle>Приглашение</CardTitle>
                <CardDescription className="text-primary-foreground">
                    Добавьте новых членов семьи
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-36 flex flex-col items-center justify-center bg-card-foreground/5 border rounded-lg border-card-foreground/10">
                    <div>Код-приглашение</div>
                    <div
                        className="text-4xl mt-4 hover:cursor-pointer"
                        onClick={() => handleCopy('code')}
                    >
                        {invitationCode}
                    </div>
                </div>
                <div className="flex gap-4 mt-4">
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => handleCopy('link')}
                    >
                        {copied ? (
                            <>
                                <Check />
                                Скопировано
                            </>
                        ) : (
                            <>
                                <Copy />
                                Копировать ссылку
                            </>
                        )}
                    </Button>
                    <Button variant="secondary" onClick={handleRefreshInvitationCode}>
                        <RefreshCcw />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
