import { healthService } from '@/lib/health';

export async function GET() {
    const ok = await healthService.isDatabaseReady();
    return Response.json(
        { status: ok ? 'ok' : 'unavailable' },
        { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
    );
}
