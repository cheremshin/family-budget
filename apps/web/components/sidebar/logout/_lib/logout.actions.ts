'use server';

import { container } from '@/lib/container';

export const logoutAction = async () => {
    const { sessionService } = container.services;
    await sessionService.invalidateSession();
};
