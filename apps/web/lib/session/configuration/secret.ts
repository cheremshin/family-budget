let cached: Uint8Array | undefined;

export function getSessionSecret(): Uint8Array {
    if (cached) return cached;

    const value = process.env.SESSION_SECRET;
    if (!value) {
        throw new Error('SESSION_SECRET missing in env');
    }

    cached = new TextEncoder().encode(value);
    return cached;
}
