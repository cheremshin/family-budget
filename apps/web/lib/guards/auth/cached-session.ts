'use server';

import { container } from '@/lib/container';
import { cache } from 'react';

export const getSession = cache(async () => {
    const { sessionService } = container.services;
    return sessionService.getSession();
});
