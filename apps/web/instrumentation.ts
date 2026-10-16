export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    const { sessionService } = await import('@/lib/session');
    sessionService.assertConfigured();
}
