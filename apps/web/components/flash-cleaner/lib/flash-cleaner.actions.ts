'use server';

import { flashMessageService } from '@/lib/flash-message';

export const clearFlashAction = async () => {
    await flashMessageService.remove();
};
