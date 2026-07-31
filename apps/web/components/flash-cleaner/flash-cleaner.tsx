'use client';

import { FC, useEffect } from 'react';

import { clearFlashAction } from './lib/flash-cleaner.actions';

export const FlashCleaner: FC = () => {
    useEffect(() => {
        clearFlashAction();
    }, []);

    return null;
};
