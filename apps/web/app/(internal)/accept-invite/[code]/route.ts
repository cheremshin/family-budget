import { FamilyError } from '@/lib/family';
import { acceptInvite } from '../_lib/accept-invite';
import { NextResponse } from 'next/server';
import { flashMessageService } from '@/lib/flash-message';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> },
) {
    const { code } = await params;

    try {
        await acceptInvite(code);
        return NextResponse.redirect(new URL('/home', request.url));
    } catch (error) {
        if (error instanceof FamilyError) {
            await flashMessageService.set({
                type: 'error',
                message: error.message,
            });

            return NextResponse.redirect(
                new URL(`/accept-invite?code=${code}`, request.url),
            );
        }

        throw error;
    }
}
