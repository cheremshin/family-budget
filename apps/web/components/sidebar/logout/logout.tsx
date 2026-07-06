'use client';

import { Button } from '@family-budget/ui';
import { FC } from 'react';
import { logoutAction } from './_lib/logout.actions';
import { LogOut } from 'lucide-react';

type PropsT = {
    className?: string;
};

export const Logout: FC<PropsT> = ({ className }) => {
    async function handleClick() {
        await logoutAction();
    }

    return (
        <Button onClick={handleClick} variant="ghost" className={className}>
            <LogOut />
            Выйти
        </Button>
    );
};
