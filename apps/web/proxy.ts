import { type NextRequest, NextResponse } from 'next/server';

import { incomesProxy } from './app/(internal)/incomes/_lib/incomes.proxy';

export function proxy(request: NextRequest) {
    switch (request.nextUrl.pathname) {
        case '/incomes':
            return incomesProxy(request);
        default:
            return NextResponse.next();
    }
}

export const config = {
    matcher: ['/incomes'],
};
