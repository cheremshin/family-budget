const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error('SESSION_SECRET missing in env');
}

export const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
