'use client';

import { FC } from 'react';

import { LogOut } from 'lucide-react';

import { Button } from '@family-budget/ui';

import { logoutAction } from './_lib/logout.actions';

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
