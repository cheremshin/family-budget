import { getRequestContext } from '@/client/request-context';
import { monthlyBudgetEventBus } from '@/lib/monthly-budget';

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

    let cleanup = () => {};

    const stream = new ReadableStream({
        start(controller) {
            let isClosed = false;

            const send = (payload: string) => {
                if (isClosed) return;

                try {
                    controller.enqueue(encoder.encode(payload));
                } catch {
                    cleanup();
                }
            };

            const unsubscribe = monthlyBudgetEventBus.subscribe(familyId, (event) => {
                send(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
            });

            const heartbeat = setInterval(() => send(': ping\n\n'), 25 * 1000);

            cleanup = () => {
                if (isClosed) return;
                isClosed = true;
                clearInterval(heartbeat);
                unsubscribe();
                try {
                    controller.close();
                } catch {
                    // уже закрыт
                }
            };

            request.signal.addEventListener('abort', cleanup);
            send(': connected\n\n');
        },
        cancel() {
            cleanup();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
