import { monthlyBudgetEventBus } from '@/lib/monthly-budget';
import { getRequestContext } from '@/lib/request-context';

export async function GET(request: Request) {
    const context = await getRequestContext();

    if (!context.user) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    if (!context.family) {
        return new Response('FamilyRequired', {
            status: 403,
        });
    }

    const familyId = context.family.id;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const unsubscribe = monthlyBudgetEventBus.subscribe(familyId, (event) => {
                const payload = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(encoder.encode(payload));
            });

            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(': ping\n\n'));
            }, 25 * 1000);

            request.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                unsubscribe();
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    });
}
