'use server';

import { container } from '@/lib/container';

export const clearFlashAction = async () => {
    await container.services.flashMessageService.delete();
};
