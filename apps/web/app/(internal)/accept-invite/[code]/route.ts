import { NextResponse } from 'next/server';

import { FamilyError } from '@family-budget/domain/family';

import { flashMessageService } from '@/lib/flash-message';
import { routes } from '@/routes';

import { acceptInvite } from '../_lib/accept-invite';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    try {
        await acceptInvite(code);
        return NextResponse.redirect(new URL(routes.home, request.url));
    } catch (error) {
        if (error instanceof FamilyError) {
            await flashMessageService.set({
                type: 'error',
                message: error.message,
            });

            return NextResponse.redirect(new URL(routes.acceptInvite(code), request.url));
        }

        throw error;
    }
}
