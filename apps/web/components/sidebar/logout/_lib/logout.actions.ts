'use server';

import { sessionService } from '@/lib/session';

export const logoutAction = async () => {
    await sessionService.invalidate();
};
